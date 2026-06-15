import { Result } from '@/shared/Result';

export interface SenderDomain {
  email: string;
  dailySentCount: number;
  maxDailyLimit: number;
}

export class OutboundCampaign {
  private senders: SenderDomain[];

  constructor(senders: SenderDomain[]) {
    this.senders = senders;
  }

  public getNextAvailableSender(): Result<SenderDomain, Error> {
    const availableSender = this.senders.find(s => s.dailySentCount < s.maxDailyLimit);

    if (!availableSender) {
      return Result.fail<SenderDomain, Error>(
        new Error('OUTBOUND_LIMIT_EXCEEDED: Todas as caixas atingiram o limite de 50 disparos hoje.')
      );
    }

    return Result.ok<SenderDomain, Error>(availableSender);
  }

  public recordDispatch(email: string): void {
    const sender = this.senders.find(s => s.email === email);
    if (sender) {
      sender.dailySentCount += 1;
    }
  }

  public getSenders(): SenderDomain[] {
    return this.senders;
  }
}
