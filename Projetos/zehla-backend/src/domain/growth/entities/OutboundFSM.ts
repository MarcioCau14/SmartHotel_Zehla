import { Result } from '@/shared/Result';

export type OutboundState = 'ACTIVE' | 'BLACKLISTED' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED';

export type OutboundEvent = 'OPT_OUT' | 'SEND_EMAIL' | 'POSITIVE_REPLY' | 'CLOSE_DEAL';

export class OutboundFSM {
  private _state: OutboundState;

  private constructor(state: OutboundState) {
    this._state = state;
  }

  public static create(initialState: OutboundState = 'ACTIVE'): OutboundFSM {
    return new OutboundFSM(initialState);
  }

  public get state(): OutboundState {
    return this._state;
  }

  public transition(event: OutboundEvent): Result<OutboundFSM, Error> {
    const currentState = this._state;

    // Se já estiver BLACKLISTED, nenhuma transição é permitida (estado terminal de privacidade)
    if (currentState === 'BLACKLISTED') {
      return Result.fail<OutboundFSM, Error>(
        new Error('INVALID_TRANSITION: Leads no estado BLACKLISTED não podem transicionar.')
      );
    }

    let newState: OutboundState;

    switch (event) {
      case 'OPT_OUT':
        newState = 'BLACKLISTED';
        break;

      case 'SEND_EMAIL':
        if (currentState === 'ACTIVE') {
          newState = 'CONTACTED';
        } else {
          return Result.fail<OutboundFSM, Error>(
            new Error(`INVALID_TRANSITION: Não é possível enviar email de prospecção para leads no estado ${currentState}`)
          );
        }
        break;

      case 'POSITIVE_REPLY':
        if (currentState === 'CONTACTED') {
          newState = 'INTERESTED';
        } else {
          return Result.fail<OutboundFSM, Error>(
            new Error(`INVALID_TRANSITION: Resposta positiva inválida para estado atual: ${currentState}`)
          );
        }
        break;

      case 'CLOSE_DEAL':
        if (currentState === 'INTERESTED') {
          newState = 'CONVERTED';
        } else {
          return Result.fail<OutboundFSM, Error>(
            new Error(`INVALID_TRANSITION: Não é possível fechar negócio para lead no estado ${currentState}`)
          );
        }
        break;

      default:
        return Result.fail<OutboundFSM, Error>(
          new Error(`INVALID_EVENT: Evento desconhecido ${event}`)
        );
    }

    this._state = newState;
    return Result.ok<OutboundFSM, Error>(this);
  }
}
