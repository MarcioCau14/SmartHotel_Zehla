export const enum ReservationSlot {
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout',
  GUESTS = 'guests',
  ROOM_TYPE = 'room_type',
  BUDGET = 'budget',
  GUEST_NAME = 'guest_name',
  SPECIAL_REQUESTS = 'special_requests',
}

export const REQUIRED_SLOTS: ReadonlyArray<ReservationSlot> = Object.freeze([
  ReservationSlot.CHECKIN,
  ReservationSlot.CHECKOUT,
  ReservationSlot.GUESTS,
]);

export const ALL_SLOTS: ReadonlyArray<ReservationSlot> = Object.freeze([
  ...REQUIRED_SLOTS,
  ReservationSlot.ROOM_TYPE,
  ReservationSlot.BUDGET,
  ReservationSlot.GUEST_NAME,
  ReservationSlot.SPECIAL_REQUESTS,
]);

export interface SlotState {
  readonly slot: ReservationSlot;
  readonly value: string | null;
  readonly confidence: number;
  readonly extractedAt: number | null;
}

export interface SlotFillingStateData {
  readonly sessionId: string;
  readonly leadId: string;
  readonly slots: ReadonlyMap<ReservationSlot, SlotState>;
  readonly currentTargetSlot: ReservationSlot | null;
  readonly completedRequired: boolean;
  readonly allCompleted: boolean;
  readonly updatedAt: number;
}

export class SlotFillingState {
  private constructor(public readonly data: Readonly<SlotFillingStateData>) {
    Object.freeze(data);
  }

  static create(sessionId: string, leadId: string, now: number = Date.now()): SlotFillingState {
    const slots = new Map<ReservationSlot, SlotState>();
    for (const slot of ALL_SLOTS) {
      slots.set(slot, Object.freeze({
        slot,
        value: null,
        confidence: 0,
        extractedAt: null,
      }));
    }

    return new SlotFillingState({
      sessionId,
      leadId,
      slots: new Map(slots),
      currentTargetSlot: REQUIRED_SLOTS[0],
      completedRequired: false,
      allCompleted: false,
      updatedAt: now,
    });
  }

  fillSlot(slot: ReservationSlot, value: string, confidence: number, now: number = Date.now()): SlotFillingState {
    const newSlots = new Map(this.data.slots);
    newSlots.set(slot, Object.freeze({
      slot,
      value,
      confidence: Math.min(Math.max(confidence, 0), 1),
      extractedAt: now,
    }));

    const nextTarget = this._findNextRequiredSlot(newSlots);

    return new SlotFillingState({
      ...this.data,
      slots: new Map(newSlots),
      currentTargetSlot: nextTarget,
      completedRequired: this._checkRequiredComplete(newSlots),
      allCompleted: this._checkAllComplete(newSlots),
      updatedAt: now,
    });
  }

  get nextPromptType(): string {
    if (!this.data.currentTargetSlot) return 'booking_confirmation';
    switch (this.data.currentTargetSlot) {
      case ReservationSlot.CHECKIN: return 'ask_checkin_date';
      case ReservationSlot.CHECKOUT: return 'ask_checkout_date';
      case ReservationSlot.GUESTS: return 'ask_guest_count';
      case ReservationSlot.ROOM_TYPE: return 'ask_room_preference';
      case ReservationSlot.BUDGET: return 'ask_budget_range';
      case ReservationSlot.GUEST_NAME: return 'ask_guest_name';
      default: return 'ask_special_requests';
    }
  }

  get completionPercentage(): number {
    const filled = Array.from(this.data.slots.values())
      .filter(s => s.value !== null).length;
    return Math.round((filled / ALL_SLOTS.length) * 100);
  }

  private _findNextRequiredSlot(slots: ReadonlyMap<ReservationSlot, SlotState>): ReservationSlot | null {
    for (const slot of REQUIRED_SLOTS) {
      const state = slots.get(slot);
      if (!state || !state.value) return slot;
    }
    for (const slot of ALL_SLOTS) {
      const state = slots.get(slot);
      if (!state || !state.value) return slot;
    }
    return null;
  }

  private _checkRequiredComplete(slots: ReadonlyMap<ReservationSlot, SlotState>): boolean {
    for (const slot of REQUIRED_SLOTS) {
      const state = slots.get(slot);
      if (!state || !state.value) return false;
    }
    return true;
  }

  private _checkAllComplete(slots: ReadonlyMap<ReservationSlot, SlotState>): boolean {
    for (const slot of ALL_SLOTS) {
      const state = slots.get(slot);
      if (!state || !state.value) return false;
    }
    return true;
  }
}
