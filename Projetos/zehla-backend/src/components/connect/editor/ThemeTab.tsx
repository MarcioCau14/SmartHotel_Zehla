'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Smartphone } from 'lucide-react';

const DEFAULT_COLORS = {
  primary: '#25D366',
  secondary: '#075E54',
  accent: '#128C7E',
  background: '#F0F2F5',
  text: '#111B21',
};

export function ThemeTab() {
  const [layout, setLayout] = useState('centered');
  const [fontFamily, setFontFamily] = useState('inter');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetch('/api/connect/theme')
      .then(res => res.json())
      .then(data => {
        if (data.colors) setColors(data.colors);
        if (data.layout) setLayout(data.layout);
        if (data.fontFamily) setFontFamily(data.fontFamily);
        if (data.buttonStyle) setButtonStyle(data.buttonStyle);
      })
      .catch(() => {});
  }, []);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/connect/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, fontFamily, buttonStyle, colors }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const buttonRadius = buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'square' ? 'rounded-md' : 'rounded-xl';

  return (
    <div className="mt-6 space-y-6">
      {/* Controls */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: '#667781' }}>Layout</label>
            <select
              className="dash-input"
              value={layout}
              onChange={e => setLayout(e.target.value)}
            >
              <option value="centered">Centralizado</option>
              <option value="compact">Compacto</option>
              <option value="cards">Cards</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: '#667781' }}>Fonte</label>
            <select
              className="dash-input"
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
            >
              <option value="inter">Inter</option>
              <option value="rubik">Rubik</option>
              <option value="serif">Serif</option>
              <option value="mono">Mono</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: '#667781' }}>Botões</label>
            <select
              className="dash-input"
              value={buttonStyle}
              onChange={e => setButtonStyle(e.target.value)}
            >
              <option value="rounded">Arredondado</option>
              <option value="pill">Pill</option>
              <option value="square">Quadrado</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium" style={{ color: '#667781' }}>Cores</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider" style={{ color: '#8696A0' }}>{key}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    value={value}
                    onChange={e => handleColorChange(key, e.target.value)}
                  />
                  <input
                    className="dash-input h-8 text-xs font-mono"
                    value={value}
                    onChange={e => handleColorChange(key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="dash-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Tema'}
          </button>
          <button
            className="dash-btn-secondary"
            onClick={() => setPreviewOpen(!previewOpen)}
          >
            <Eye className="w-4 h-4" />
            {previewOpen ? 'Fechar Preview' : 'Ver Preview'}
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {previewOpen && (
        <div className="dash-section p-6">
          <h3 className="dash-section-title mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Pré-visualização
          </h3>
          <div className="flex justify-center">
            <div
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border"
              style={{ backgroundColor: colors.background, borderColor: '#E9EDEF' }}
            >
              {/* Cover */}
              <div className="h-32 bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366]" />

              {/* Avatar */}
              <div className="px-4 pb-6">
                <div className="flex flex-col items-center -mt-10">
                  <div
                    className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-xl font-bold"
                    style={{ borderColor: colors.background, backgroundColor: '#E9EDEF', color: '#8696A0' }}
                  >
                    P
                  </div>
                  <h3 className="text-lg font-bold mt-3" style={{ color: colors.text }}>Pousada Exemplo</h3>
                  <p className="text-xs mt-1" style={{ color: '#667781' }}>Imbituba, SC</p>
                  <p className="text-sm mt-3 text-center" style={{ color: '#667781' }}>
                    Sua pousada perfeita em Imbituba, SC. Reserve direto e economize!
                  </p>
                </div>

                {/* Links preview */}
                <div className="mt-6 space-y-3">
                  {[
                    { icon: 'whatsapp', label: 'Reservar via WhatsApp' },
                    { icon: 'booking', label: 'Ver Disponibilidade' },
                    { icon: 'instagram', label: 'Siga no Instagram' },
                  ].map((link, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-3 ${buttonRadius}`}
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E9EDEF' }}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.text }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                          </svg>
                        </span>
                        {link.label}
                      </span>
                      <svg className="w-3.5 h-3.5" style={{ color: '#8696A0' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* WhatsApp CTA */}
                <div className="mt-6 flex justify-center">
                  <div
                    className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Fale conosco
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
