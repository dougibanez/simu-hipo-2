import { useState, useCallback } from "react";

const UF = 38942.78;

const BANCOS = [
  { id:"itau", nombre:"Banco Itaú", emoji:"🔵", tasas:{fija:3.39,mixta:3.20,variable:2.85}, caeExtra:0.45, financMax:85, financMax2da:70, fogaes:false, destacado:"Tasa fija más baja del mercado", color:"#1a56db" },
  { id:"falabella", nombre:"Banco Falabella", emoji:"🟢", tasas:{fija:3.70,mixta:3.45,variable:3.10}, caeExtra:0.40, financMax:90, financMax2da:70, fogaes:false, destacado:"Financia hasta 90% primera vivienda", color:"#057a55" },
  { id:"bci", nombre:"Banco BCI", emoji:"🔷", tasas:{fija:3.85,mixta:3.60,variable:3.25}, caeExtra:0.55, financMax:80, financMax2da:70, fogaes:true, tasaFogaes:3.15, destacado:"FOGAES + Crédito Verde", color:"#5521b5" },
  { id:"estado", nombre:"BancoEstado", emoji:"🟠", tasas:{fija:4.19,mixta:3.90,variable:3.55}, caeExtra:0.35, financMax:80, financMax2da:70, fogaes:true, tasaFogaes:3.03, destacado:"HipoteAzo + Subsidio estatal", color:"#c27803" },
  { id:"santander", nombre:"Santander", emoji:"🔴", tasas:{fija:3.90,mixta:3.65,variable:3.30}, caeExtra:0.50, financMax:80, financMax2da:70, fogaes:true, tasaFogaes:3.28, destacado:"FOGAES competitivo 3.28%", color:"#c81e1e" },
  { id:"chile", nombre:"Banco de Chile", emoji:"🩵", tasas:{fija:3.95,mixta:3.70,variable:3.35}, caeExtra:0.55, financMax:80, financMax2da:70, fogaes:true, tasaFogaes:3.25, destacado:"FOGAES 3.25% + mayor red", color:"#1c64f2" },
  { id:"scotiabank", nombre:"Scotiabank", emoji:"🟥", tasas:{fija:4.20,mixta:3.90,variable:3.50}, caeExtra:0.60, financMax:85, financMax2da:70, fogaes:false, destacado:"Mes libre anual + gracia 6m", color:"#e02424" },
  { id:"security", nombre:"Banco Security", emoji:"⚫", tasas:{fija:4.35,mixta:4.10,variable:3.75}, caeExtra:0.65, financMax:75, financMax2da:65, fogaes:false, destacado:"Banca premium, alto valor", color:"#374151" },
  { id:"bice", nombre:"Banco BICE", emoji:"🟣", tasas:{fija:4.25,mixta:4.00,variable:3.65}, caeExtra:0.55, financMax:80, financMax2da:70, fogaes:false, destacado:"Hipoteca verde certificada", color:"#6d28d9" },
  { id:"coopeuch", nombre:"Coopeuch", emoji:"🟤", tasas:{fija:4.50,mixta:4.20,variable:3.90}, caeExtra:0.30, financMax:80, financMax2da:65, fogaes:false, destacado:"Menor CAE por seguros baratos", color:"#92400e" },
  { id:"internacional", nombre:"Banco Internacional", emoji:"🌐", tasas:{fija:4.45,mixta:4.15,variable:3.80}, caeExtra:0.60, financMax:75, financMax2da:65, fogaes:false, destacado:"Flexible para extranjeros", color:"#065f46" },
  { id:"consorcio", nombre:"Banco Consorcio", emoji:"🏛️", tasas:{fija:4.55,mixta:4.25,variable:3.95}, caeExtra:0.50, financMax:80, financMax2da:70, fogaes:false, destacado:"Pack seguros integrado", color:"#1e3a5f" },
  { id:"ripley", nombre:"Banco Ripley", emoji:"🟠", tasas:{fija:4.80,mixta:4.50,variable:4.10}, caeExtra:0.70, financMax:80, financMax2da:65, fogaes:false, destacado:"Para clientes actuales Ripley", color:"#ea580c" },
  { id:"mut_security", nombre:"Mutuaria Security", emoji:"🏢", tasas:{fija:4.60,mixta:4.30,variable:4.00}, caeExtra:0.80, financMax:75, financMax2da:60, fogaes:false, destacado:"Aprobación más rápida", color:"#166534" },
  { id:"mut_bci", nombre:"Mutuaria BCI", emoji:"🏗️", tasas:{fija:4.70,mixta:4.40,variable:4.05}, caeExtra:0.85, financMax:75, financMax2da:60, fogaes:false, destacado:"Vinculada BCI, proceso ágil", color:"#1d4ed8" },
];

function fmtCLP(n) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}
function fmtUF(n) {
  return n.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function calcDiv(montoUF, tasaAnual, plazoAnios) {
  const n = plazoAnios * 12;
  const r = tasaAnual / 100 / 12;
  if (r === 0) return montoUF / n;
  return montoUF * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function App() {
  const [valorProp, setValorProp] = useState(3000);
  const [piePct, setPiePct] = useState(20);
  const [plazo, setPlazo] = useState(25);
  const [tipoProp, setTipoProp] = useState("nueva");
  const [tipoTasa, setTipoTasa] = useState("fija");
  const [resultados, setResultados] = useState([]);
  const [simulado, setSimulado] = useState(false);

  const credUF = valorProp * (1 - piePct / 100);
  const credCLP = credUF * UF;

  const simular = useCallback(() => {
    const res = BANCOS.map(b => {
      const tasa = b.tasas[tipoTasa];
      const divUF = calcDiv(credUF, tasa, plazo);
      const divCLP = divUF * UF;
      const totalPago = divCLP * plazo * 12;
      const totalIntereses = totalPago - credCLP;
      const cae = tasa + b.caeExtra;
      const maxFinanc = tipoProp === "segunda" ? b.financMax2da : b.financMax;
      const pctFinanc = (1 - piePct / 100) * 100;
      const excede = pctFinanc > maxFinanc;
      let divFogaesCLP = null;
      if (b.fogaes && tipoProp === "nueva") {
        divFogaesCLP = calcDiv(credUF, b.tasaFogaes, plazo) * UF;
      }
      return { ...b, tasa, divUF, divCLP, totalPago, totalIntereses, cae, maxFinanc, excede, divFogaesCLP };
    });
    res.sort((a, b) => a.divCLP - b.divCLP);
    setResultados(res);
    setSimulado(true);
  }, [credUF, credCLP, plazo, tipoProp, tipoTasa, piePct]);

  const bestDiv = resultados.length ? resultados[0].divCLP : 0;
  const worstDiv = resultados.length ? resultados[resultados.length - 1].divCLP : 0;
  const avgDiv = resultados.length ? resultados.reduce((s, r) => s + r.divCLP, 0) / resultados.length : 0;
  const ahorro = (worstDiv - bestDiv) * plazo * 12;
  const minCAE = resultados.length ? Math.min(...resultados.map(r => r.cae)) : 0;
  const maxCAE = resultados.length ? Math.max(...resultados.map(r => r.cae)) : 1;

  const s = {
    page: { fontFamily: "system-ui,sans-serif", background: "#0d1117", minHeight: "100vh", color: "#e6edf3", padding: "0 0 48px" },
    header: { background: "linear-gradient(135deg,#0d1117 0%,#161b22 100%)", borderBottom: "1px solid #21262d", padding: "32px 24px 28px", textAlign: "center" },
    badge: { display: "inline-block", background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.3)", borderRadius: 100, padding: "4px 14px", fontSize: 11, color: "#00d2ff", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 },
    h1: { fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 800, margin: "0 0 10px", lineHeight: 1.15 },
    grad: { background: "linear-gradient(135deg,#00d2ff,#00ffa3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    sub: { color: "#8b949e", fontSize: 14, maxWidth: 520, margin: "0 auto" },
    ufBar: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 28px", background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: "12px 20px", margin: "20px auto", maxWidth: 900, fontSize: 13 },
    ufLabel: { color: "#8b949e" },
    ufVal: { color: "#00ffa3", fontWeight: 700, marginLeft: 6 },
    container: { maxWidth: 1300, margin: "0 auto", padding: "0 16px" },
    card: { background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: "28px 28px 24px", marginBottom: 24, position: "relative", overflow: "hidden" },
    cardTop: { position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#00d2ff,#00ffa3)" },
    sectionTitle: { fontWeight: 800, fontSize: "1.15rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 },
    icon: { width: 34, height: 34, background: "linear-gradient(135deg,#00d2ff,#00ffa3)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 },
    tabs: { display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" },
    tab: (active) => ({ padding: "7px 18px", borderRadius: 100, border: active ? "1px solid #00d2ff" : "1px solid #21262d", background: active ? "rgba(0,210,255,0.12)" : "transparent", color: active ? "#00d2ff" : "#8b949e", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all .2s" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 18, marginBottom: 22 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8b949e", fontWeight: 600 },
    input: { background: "#0d1117", border: "1px solid #21262d", borderRadius: 9, padding: "11px 13px", color: "#e6edf3", fontFamily: "inherit", fontSize: 15, width: "100%" },
    select: { background: "#0d1117", border: "1px solid #21262d", borderRadius: 9, padding: "11px 13px", color: "#e6edf3", fontFamily: "inherit", fontSize: 15, width: "100%", appearance: "none" },
    rangeVal: { textAlign: "center", fontSize: 20, fontWeight: 800, color: "#00ffa3", marginBottom: 4 },
    range: { width: "100%", accentColor: "#00d2ff", cursor: "pointer" },
    rangeRow: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8b949e", marginTop: 3 },
    btn: { width: "100%", background: "linear-gradient(135deg,#00d2ff,#00ffa3)", color: "#0d1117", border: "none", borderRadius: 11, padding: "15px", fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" },
    summCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 26 },
    summCard: (type) => {
      const cols = { best: "#00ffa3", worst: "#ff4757", diff: "#f5c842", avg: "#00d2ff" };
      return { background: "#161b22", border: `1px solid ${cols[type]}33`, borderRadius: 13, padding: "18px 18px 14px", borderTop: `3px solid ${cols[type]}` };
    },
    sLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8b949e", marginBottom: 4 },
    sBank: { fontSize: 12, fontWeight: 600, color: "#00d2ff", marginBottom: 2 },
    sVal: (type) => {
      const cols = { best: "#00ffa3", worst: "#ff4757", diff: "#f5c842", avg: "#00d2ff" };
      return { fontSize: "1.5rem", fontWeight: 800, color: cols[type] };
    },
    sSub: { fontSize: 11, color: "#8b949e", marginTop: 3 },
    tWrap: { overflowX: "auto", borderRadius: 13, border: "1px solid #21262d" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { background: "#161b22", padding: "12px 14px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8b949e", whiteSpace: "nowrap", borderBottom: "1px solid #21262d" },
    disclaimer: { background: "rgba(0,210,255,0.04)", border: "1px solid rgba(0,210,255,0.15)", borderRadius: 11, padding: "14px 18px", fontSize: 12, color: "#8b949e", lineHeight: 1.6, marginTop: 20 },
  };

  function TasaColor({ val }) {
    const c = val < 3.7 ? "#00ffa3" : val < 4.0 ? "#00d2ff" : val < 4.5 ? "#ff9f43" : "#ff4757";
    return <span style={{ fontWeight: 700, fontSize: 15, color: c }}>{val}%</span>;
  }

  function RankBadge({ i }) {
    const styles = [
      { background: "#ffd700", color: "#000" },
      { background: "#c0c0c0", color: "#000" },
      { background: "#cd7f32", color: "#fff" },
      { background: "#21262d", color: "#8b949e" },
    ];
    const st = i < 3 ? styles[i] : styles[3];
    return <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, ...st }}>{i + 1}</div>;
  }

  function DifChip({ dif }) {
    if (dif === 0) return <span style={{ background: "rgba(0,255,163,.12)", color: "#00ffa3", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>✓ El mejor</span>;
    const big = dif > 30000;
    return <span style={{ background: big ? "rgba(255,71,87,.12)" : "rgba(255,159,67,.1)", color: big ? "#ff4757" : "#ff9f43", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>+{fmtCLP(dif)}/mes</span>;
  }

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.badge}>● Datos actualizados mayo 2026</div>
        <h1 style={s.h1}>Simulador <span style={s.grad}>Hipotecario</span> Chile</h1>
        <p style={s.sub}>Compara créditos de todos los bancos del sistema financiero. Calcula dividendos, CAE y costo total.</p>
        <div style={s.ufBar}>
          <span><span style={s.ufLabel}>UF hoy:</span><span style={s.ufVal}>$38.942,78</span></span>
          <span><span style={s.ufLabel}>Tasa promedio sistema:</span><span style={s.ufVal}>4,10% anual</span></span>
          <span><span style={s.ufLabel}>TPM Banco Central:</span><span style={s.ufVal}>4,50%</span></span>
          <span><span style={s.ufLabel}>Subsidio Ley 21.748:</span><span style={{ color: "#f5c842", fontWeight: 700, marginLeft: 6 }}>Vigente ✓</span></span>
        </div>
      </div>

      <div style={s.container}>
        <div style={{ height: 28 }} />

        {/* FORM */}
        <div style={s.card}>
          <div style={s.cardTop} />
          <div style={s.sectionTitle}><div style={s.icon}>🏠</div> Parámetros del Crédito</div>

          <div style={s.tabs}>
            {["fija","mixta","variable"].map(t => (
              <button key={t} style={s.tab(tipoTasa === t)} onClick={() => setTipoTasa(t)}>
                Tasa {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={s.grid}>
            <div style={s.field}>
              <label style={s.label}>Valor de la Propiedad (UF)</label>
              <input style={s.input} type="number" value={valorProp} min={500} max={20000} step={50}
                onChange={e => setValorProp(Number(e.target.value))} />
              <span style={{ fontSize: 11, color: "#8b949e" }}>≈ {fmtCLP(valorProp * UF)} CLP</span>
            </div>

            <div style={s.field}>
              <label style={s.label}>Pie</label>
              <div style={s.rangeVal}>{piePct}%</div>
              <input style={s.range} type="range" min={10} max={50} step={5} value={piePct}
                onChange={e => setPiePct(Number(e.target.value))} />
              <div style={s.rangeRow}><span>10%</span><span>30%</span><span>50%</span></div>
              <span style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>
                Pie: UF {fmtUF(valorProp * piePct / 100)} · Crédito: UF {fmtUF(credUF)}
              </span>
            </div>

            <div style={s.field}>
              <label style={s.label}>Plazo</label>
              <div style={s.rangeVal}>{plazo} años</div>
              <input style={s.range} type="range" min={5} max={30} step={1} value={plazo}
                onChange={e => setPlazo(Number(e.target.value))} />
              <div style={s.rangeRow}><span>5</span><span>15</span><span>30</span></div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Tipo de Propiedad</label>
              <select style={s.select} value={tipoProp} onChange={e => setTipoProp(e.target.value)}>
                <option value="nueva">Vivienda Nueva</option>
                <option value="usada">Vivienda Usada</option>
                <option value="segunda">2ª o más propiedad</option>
              </select>
            </div>
          </div>

          <button style={s.btn} onClick={simular}>⚡ SIMULAR Y COMPARAR TODOS LOS BANCOS</button>
        </div>

        {/* RESULTS */}
        {simulado && (
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 18, display:"flex", alignItems:"center", gap:10 }}>
              <span>📊</span> Comparativo de {resultados.length} Instituciones
              <span style={{ fontSize: 12, color:"#8b949e", fontWeight:400 }}>· Tasa {tipoTasa} · UF {fmtUF(credUF)} · {plazo} años</span>
            </div>

            {/* SUMMARY */}
            <div style={s.summCards}>
              <div style={s.summCard("best")}>
                <div style={s.sLbl}>🥇 Mejor opción</div>
                <div style={s.sBank}>{resultados[0].nombre}</div>
                <div style={s.sVal("best")}>{fmtCLP(bestDiv)}</div>
                <div style={s.sSub}>Dividendo mensual · Tasa {resultados[0].tasa}%</div>
              </div>
              <div style={s.summCard("worst")}>
                <div style={s.sLbl}>⚠️ Más cara</div>
                <div style={s.sBank}>{resultados[resultados.length-1].nombre}</div>
                <div style={s.sVal("worst")}>{fmtCLP(worstDiv)}</div>
                <div style={s.sSub}>Dividendo mensual · Tasa {resultados[resultados.length-1].tasa}%</div>
              </div>
              <div style={s.summCard("diff")}>
                <div style={s.sLbl}>💰 Ahorro total (mejor vs peor)</div>
                <div style={s.sBank}>A lo largo de {plazo} años</div>
                <div style={s.sVal("diff")}>{fmtCLP(ahorro)}</div>
                <div style={s.sSub}>{fmtCLP(worstDiv - bestDiv)} / mes de diferencia</div>
              </div>
              <div style={s.summCard("avg")}>
                <div style={s.sLbl}>📊 Promedio mercado</div>
                <div style={s.sBank}>Todas las instituciones</div>
                <div style={s.sVal("avg")}>{fmtCLP(avgDiv)}</div>
                <div style={s.sSub}>UF {fmtUF(credUF)} · {plazo} años · {tipoTasa}</div>
              </div>
            </div>

            {/* TABLE */}
            <div style={s.tWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["#","Banco","Tasa Anual","CAE","Dividendo/mes","Total Intereses","Financ. Máx","Dif. vs Mejor","Destacado"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, i) => {
                    const esBest = i === 0;
                    const esWorst = i === resultados.length - 1;
                    const rowBg = esBest ? "rgba(0,255,163,0.06)" : esWorst ? "rgba(255,71,87,0.05)" : i % 2 === 0 ? "#0d1117" : "transparent";
                    const caePct = maxCAE > minCAE ? ((r.cae - minCAE) / (maxCAE - minCAE)) * 100 : 50;
                    const caeColor = r.cae <= minCAE + 0.3 ? "#00ffa3" : r.cae <= minCAE + 0.8 ? "#00d2ff" : r.cae <= minCAE + 1.2 ? "#ff9f43" : "#ff4757";
                    const tdStyle = { padding: "13px 14px", borderBottom: "1px solid #21262d", background: rowBg, verticalAlign: "middle" };

                    return (
                      <tr key={r.id}>
                        <td style={tdStyle}><RankBadge i={i} /></td>
                        <td style={tdStyle}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:32, height:32, borderRadius:8, background: r.color+"22", border:`1px solid ${r.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{r.emoji}</div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:13, color: esBest ? "#00ffa3" : esWorst ? "#ff4757" : "#e6edf3" }}>{r.nombre}</div>
                              {r.fogaes && <span style={{ fontSize:10, background:"rgba(245,200,66,.15)", color:"#f5c842", padding:"1px 6px", borderRadius:4, fontWeight:700 }}>FOGAES</span>}
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <TasaColor val={r.tasa} />
                          <div style={{ fontSize:11, color:"#8b949e" }}>UF+spread anual</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight:700, color: caeColor }}>{r.cae.toFixed(2)}%</div>
                          <div style={{ width:80, height:5, background:"#21262d", borderRadius:3, marginTop:4, overflow:"hidden" }}>
                            <div style={{ width: (caePct+10)+"%", height:"100%", background: caeColor, borderRadius:3 }} />
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:15, color: esBest?"#00ffa3": esWorst?"#ff4757":"#e6edf3" }}>{fmtCLP(r.divCLP)}</div>
                          <div style={{ fontSize:11, color:"#8b949e" }}>UF {fmtUF(r.divUF)}/mes</div>
                          {r.divFogaesCLP && (
                            <div style={{ fontSize:11, color:"#f5c842", marginTop:3 }}>⭐ c/FOGAES: {fmtCLP(r.divFogaesCLP)}</div>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight:700, color: esBest?"#00ffa3": esWorst?"#ff4757":"#e6edf3" }}>{fmtCLP(r.totalIntereses)}</div>
                          <div style={{ fontSize:11, color:"#8b949e" }}>Total: {fmtCLP(r.totalPago)}</div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding:"3px 9px", borderRadius:100, fontSize:11, fontWeight:700, background: r.excede?"rgba(255,71,87,.15)":"rgba(0,210,255,.1)", color: r.excede?"#ff4757":"#00d2ff", border: r.excede?"1px solid #ff475733":"1px solid #00d2ff33" }}>
                            {r.excede ? "⚠ Excede" : "Hasta"} {r.maxFinanc}%
                          </span>
                        </td>
                        <td style={tdStyle}><DifChip dif={r.divCLP - bestDiv} /></td>
                        <td style={{ ...tdStyle, fontSize:12, color:"#8b949e", maxWidth:160 }}>{r.destacado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={s.disclaimer}>
              <strong style={{ color:"#00d2ff" }}>⚠ Aviso:</strong> Tasas referenciales basadas en CMF, Banco Central y bancos individuales (mayo 2026). El dividendo real incluye seguros de desgravamen e incendio/sismo no considerados aquí. Compara siempre por <strong style={{ color:"#00d2ff" }}>CAE</strong> y cotiza en al menos 3 instituciones. Subsidio FOGAES Ley 21.748 aplica a viviendas nuevas hasta UF 4.000.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
