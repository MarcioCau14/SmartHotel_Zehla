import { describe, it, expect } from 'vitest'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'
import { ScoreEngajamento } from '../../../domain/marketing/value-objects/ScoreEngajamento'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'

describe('Sentimento', () => {
  it('should create critico for nota 1-3', () => {
    expect(Sentimento.criar(1).value!.value).toBe('critico')
    expect(Sentimento.criar(2).value!.value).toBe('critico')
    expect(Sentimento.criar(3).value!.value).toBe('critico')
  })

  it('should create negativo for nota 4-5', () => {
    expect(Sentimento.criar(4).value!.value).toBe('negativo')
    expect(Sentimento.criar(5).value!.value).toBe('negativo')
  })

  it('should create neutro for nota 6-7', () => {
    expect(Sentimento.criar(6).value!.value).toBe('neutro')
    expect(Sentimento.criar(7).value!.value).toBe('neutro')
  })

  it('should create positivo for nota 8-10', () => {
    expect(Sentimento.criar(8).value!.value).toBe('positivo')
    expect(Sentimento.criar(9).value!.value).toBe('positivo')
    expect(Sentimento.criar(10).value!.value).toBe('positivo')
  })

  it('should reject nota outside 1-10', () => {
    expect(Sentimento.criar(0).isFail).toBe(true)
    expect(Sentimento.criar(11).isFail).toBe(true)
    expect(Sentimento.criar(-1).isFail).toBe(true)
  })

  it('should reject non-finite nota', () => {
    expect(Sentimento.criar(NaN).isFail).toBe(true)
    expect(Sentimento.criar(Infinity).isFail).toBe(true)
  })

  it('M1: nota 2 is critico (deterministic)', () => {
    const r1 = Sentimento.criar(2)
    const r2 = Sentimento.criar(2)
    expect(r1.isOk).toBe(true)
    expect(r2.isOk).toBe(true)
    expect(r1.value!.value).toBe(r2.value!.value)
  })

  it('should expose isCritico correctly', () => {
    expect(Sentimento.criar(1).value!.isCritico).toBe(true)
    expect(Sentimento.criar(3).value!.isCritico).toBe(true)
    expect(Sentimento.criar(4).value!.isCritico).toBe(false)
    expect(Sentimento.criar(10).value!.isCritico).toBe(false)
  })
})

describe('ScoreEngajamento', () => {
  it('should create valid score', () => {
    expect(ScoreEngajamento.criar(50).value!.value).toBe(50)
  })

  it('should reject score < 0', () => {
    expect(ScoreEngajamento.criar(-1).isFail).toBe(true)
  })

  it('should reject score > 100', () => {
    expect(ScoreEngajamento.criar(101).isFail).toBe(true)
  })

  it('should detect critico (< 10)', () => {
    expect(ScoreEngajamento.criar(5).value!.isCritico).toBe(true)
    expect(ScoreEngajamento.criar(10).value!.isCritico).toBe(false)
  })

  it('should detect excelente (> 90)', () => {
    expect(ScoreEngajamento.criar(95).value!.isExcelente).toBe(true)
    expect(ScoreEngajamento.criar(90).value!.isExcelente).toBe(false)
  })
})

describe('CanalDistribuicao', () => {
  it('should create valid canal', () => {
    expect(CanalDistribuicao.criar('booking').value!.value).toBe('booking')
    expect(CanalDistribuicao.criar('instagram').value!.value).toBe('instagram')
  })

  it('should reject invalid canal', () => {
    expect(CanalDistribuicao.criar('tiktok').isFail).toBe(true)
  })

  it('should detect social channels', () => {
    expect(CanalDistribuicao.criar('instagram').value!.isSocial).toBe(true)
    expect(CanalDistribuicao.criar('facebook').value!.isSocial).toBe(true)
    expect(CanalDistribuicao.criar('booking').value!.isSocial).toBe(false)
  })

  it('should detect read-only channels', () => {
    expect(CanalDistribuicao.criar('booking').value!.isReadOnly).toBe(true)
    expect(CanalDistribuicao.criar('instagram').value!.isReadOnly).toBe(false)
  })
})
