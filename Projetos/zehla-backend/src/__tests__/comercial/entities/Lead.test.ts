import { Lead } from '../../../domain/comercial/entities/Lead'
import { Canal } from '../../../domain/comercial/value-objects/Canal'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'
import { Score } from '../../../domain/comercial/value-objects/Score'
import { Result } from '../../../shared/Result'

describe('Lead Entity', () => {
  const propriedadeId = 'prop_123'
  const canal = Canal.criar('site').value as Canal
  const dataCaptura = new Date()

  describe('Creation', () => {
    it('should create a valid lead with minimal data', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura
      })

      expect(leadResult.isOk).toBe(true)
      if (leadResult.isOk) {
        const lead = leadResult.value
        expect(lead.id).toBe('lead_1')
        expect(lead.canal).toBe(canal)
        expect(lead.propriedadeId).toBe(propriedadeId)
        expect(lead.dataCaptura).toBe(dataCaptura)
        expect(lead.status).toBe('novo')
      }
    })

    it('should reject lead with empty id', () => {
      const leadResult = Lead.create({
        id: '',
        canal,
        propriedadeId,
        dataCaptura
      })

       expect(leadResult.isFail).toBe(true)
       expect(leadResult.error).toBeInstanceOf(Error)
    })

    it('should reject lead with missing propriedadeId', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId: '',
        dataCaptura
      })

      expect(leadResult.isFail).toBe(true)
    })

    it('should accept lead with valid email', () => {
      const email = Email.criar('test@example.com').value as Email
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        email
      })

      expect(leadResult.isOk).toBe(true)
    })

    it('should reject lead with invalid email', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        email: 'invalid-email' as unknown as Email
      })

      expect(leadResult.isFail).toBe(true)
    })

    it('should accept lead with valid document', () => {
      const documento = Documento.criar('123.456.789-09', 'CPF').value as Documento
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        documento
      })

      expect(leadResult.isOk).toBe(true)
    })

    it('should reject lead with invalid document', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        documento: '123' as unknown as Documento
      })

      expect(leadResult.isFail).toBe(true)
    })

    it('should accept lead with valid score', () => {
      const score = Score.criar(85).value as Score
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        score
      })

      expect(leadResult.isOk).toBe(true)
    })

    it('should reject lead with invalid score (< 0)', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        score: -5 as unknown as Score
      })

      expect(leadResult.isFail).toBe(true)
    })

    it('should reject lead with invalid score (> 100)', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        score: 105 as unknown as Score
      })

      expect(leadResult.isFail).toBe(true)
    })

    it('should set status to novo by default', () => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura
      })

      expect(leadResult.isOk).toBe(true)
      if (leadResult.isOk) {
        const lead = leadResult.value
        expect(lead.id).toBe('lead_1')
        expect(lead.canal).toBe(canal)
        expect(lead.propriedadeId).toBe(propriedadeId)
        expect(lead.dataCaptura).toBe(dataCaptura)
        expect(lead.status).toBe('novo')
      }
    })
  })

  describe('State Transitions', () => {
    let lead: Lead

    beforeEach(() => {
      const leadResult = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        nome: 'João Silva',
        email: Email.criar('joao@example.com').value as Email,
        score: Score.criar(50).value as Score
      })
      lead = leadResult.value as Lead
    })

    it('should qualify lead with sufficient score', () => {
      const qualificacaoResult = lead.qualificar()
      expect(qualificacaoResult.isOk).toBe(true)
      if (qualificacaoResult.isOk) {
        expect(qualificacaoResult.value.status).toBe('qualificado')
      }
    })

    it('should reject qualification of lead with insufficient score', () => {
      const leadBaixoScore = Lead.create({
        id: 'lead_2',
        canal,
        propriedadeId,
        dataCaptura,
        nome: 'João Silva',
        email: Email.criar('joao@example.com').value as Email,
        score: Score.criar(20).value as Score
      }).value as Lead

      const qualificacaoResult = leadBaixoScore.qualificar()
      expect(qualificacaoResult.isFail).toBe(true)
    })

    it('should reject qualification of lead without score', () => {
      const leadSemScore = Lead.create({
        id: 'lead_3',
        canal,
        propriedadeId,
        dataCaptura,
        nome: 'João Silva',
        email: Email.criar('joao@example.com').value as Email
      }).value as Lead

      const qualificacaoResult = leadSemScore.qualificar()
      expect(qualificacaoResult.isFail).toBe(true)
    })

    it('should transition from qualified to proposed', () => {
      const leadQualificado = lead.qualificar().value as Lead
      const proposicaoResult = leadQualificado.propostar()
      expect(proposicaoResult.isOk).toBe(true)
      if (proposicaoResult.isOk) {
        expect(proposicaoResult.value.status).toBe('propostado')
      }
    })

    it('should reject proposing non-qualified lead', () => {
      const proposicaoResult = lead.propostar()
      expect(proposicaoResult.isFail).toBe(true)
    })

    it('should transition from proposed to converted with document', () => {
      const leadQualificado = lead.qualificar().value as Lead
      const leadPropostado = leadQualificado.propostar().value as Lead
      const leadComDoc = new Lead(
        leadPropostado.id,
        leadPropostado.canal,
        leadPropostado.propriedadeId,
        leadPropostado.dataCaptura,
        leadPropostado.nome,
        leadPropostado.email,
        leadPropostado.telefone,
        Documento.criar('123.456.789-09', 'CPF').value as Documento,
        leadPropostado.score,
        leadPropostado.status,
        leadPropostado.origemUrl,
        leadPropostado.tags,
        leadPropostado.ultimaInteracao
      )

      const conversaoResult = leadComDoc.converter()
      expect(conversaoResult.isOk).toBe(true)
      if (conversaoResult.isOk) {
        expect(conversaoResult.value.status).toBe('convertido')
      }
    })

    it('should reject converting proposed lead without document', () => {
      const leadQualificado = lead.qualificar().value as Lead
      const leadPropostado = leadQualificado.propostar().value as Lead

      const conversaoResult = leadPropostado.converter()
      expect(conversaoResult.isFail).toBe(true)
    })

    it('should transition from proposed to lost', () => {
      const leadQualificado = lead.qualificar().value as Lead
      const leadPropostado = leadQualificado.propostar().value as Lead

      const perderResult = leadPropostado.perder('Lost to competitor')
      expect(perderResult.isOk).toBe(true)
      if (perderResult.isOk) {
        expect(perderResult.value.status).toBe('perdido')
      }
    })

    it('should reject converting lost lead', () => {
      const leadQualificado = lead.qualificar().value as Lead
      const leadPerdido = leadQualificado.perder('Lost').value as Lead

      const converterResult = leadPerdido.converter()
      expect(converterResult.isFail).toBe(true)
    })

    it('should reactivate lost lead to novo', () => {
      const leadQualificado = lead.qualificar().value as Lead
      const leadPerdido = leadQualificado.perder('Lost').value as Lead

      const reativarResult = leadPerdido.reativar()
      expect(reativarResult.isOk).toBe(true)
      if (reativarResult.isOk) {
        expect(reativarResult.value.status).toBe('novo')
      }
    })

    it('should reject reactivating non-lost lead', () => {
      const reativarResult = lead.reativar()
      expect(reativarResult.isFail).toBe(true)
    })
  })

  describe('Getters', () => {
    it('should return qualified status when score >= 30', () => {
      const leadQualificado = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        nome: 'João Silva',
        email: Email.criar('joao@example.com').value as Email,
        score: Score.criar(30).value as Score
      }).value as Lead

      expect(leadQualificado.ehQualificado).toBe(true)
    })

    it('should return not qualified status when score < 30', () => {
      const leadNaoQualificado = Lead.create({
        id: 'lead_2',
        canal,
        propriedadeId,
        dataCaptura,
        nome: 'João Silva',
        email: Email.criar('joao@example.com').value as Email,
        score: Score.criar(25).value as Score
      }).value as Lead

      expect(leadNaoQualificado.ehQualificado).toBe(false)
    })

    it('should return converted status when status is convertido', () => {
      const leadComDoc = Lead.create({
        id: 'lead_1',
        canal,
        propriedadeId,
        dataCaptura,
        nome: 'João Silva',
        email: Email.criar('joao@example.com').value as Email,
        documento: Documento.criar('123.456.789-09', 'CPF').value as Documento,
        score: Score.criar(50).value as Score
      }).value as Lead

      const leadQualificado = leadComDoc.qualificar().value as Lead
      const leadPropostado = leadQualificado.propostar().value as Lead
      const leadConvertido = leadPropostado.converter().value as Lead

      expect(leadConvertido.ehConvertido).toBe(true)
    })
  })
})