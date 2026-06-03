import { useState } from "react";
import "./App.css";

const coresLinguagens = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  "C++": "#f34b7d",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Swift: "#ffac45",
};

function calcularLinguagens(repos) {
  const contagem = {};
  repos.forEach((repo) => {
    if (repo.language) {
      contagem[repo.language] = (contagem[repo.language] || 0) + 1;
    }
  });
  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({
      lang,
      count,
      percent: Math.round((count / total) * 100),
      cor: coresLinguagens[lang] || "#00e5ff",
    }));
}

function App() {
  const [usuario, setUsuario] = useState("");
  const [dados, setDados] = useState(null);
  const [repos, setRepos] = useState([]);
  const [linguagens, setLinguagens] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscarUsuario() {
    if (!usuario) return;
    setCarregando(true);
    setErro("");
    setDados(null);
    setRepos([]);
    setLinguagens([]);
    try {
      const resUsuario = await fetch("https://api.github.com/users/" + usuario);
      if (!resUsuario.ok) {
        setErro("Usuario nao encontrado.");
        return;
      }
      const json = await resUsuario.json();
      setDados(json);

      const resRepos = await fetch("https://api.github.com/users/" + usuario + "/repos?per_page=100");
      const jsonRepos = await resRepos.json();
      setRepos(jsonRepos.slice(0, 6));
      setLinguagens(calcularLinguagens(jsonRepos));
    } catch (e) {
      setErro("Erro ao buscar.");
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") buscarUsuario();
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="logo">Dev<span>Hub</span></h1>
        <p className="subtitle">Explore perfis do GitHub</p>
      </div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Digite um usuario GitHub..."
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input"
        />
        <button onClick={buscarUsuario} className="btn">Buscar</button>
      </div>
      {carregando && <p className="status">Buscando...</p>}
      {erro && <p className="erro">{erro}</p>}
      {dados && (
        <div className="card">
          <div className="card-top">
            <img src={dados.avatar_url} alt="avatar" className="avatar" />
            <div className="info">
              <h2>{dados.name || dados.login}</h2>
              <p className="login">@{dados.login}</p>
              <p className="bio">{dados.bio || "Sem bio."}</p>
              <a href={dados.html_url} target="_blank" rel="noreferrer" className="github-link">
                Ver no GitHub
              </a>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="stat-num">{dados.followers}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat">
              <span className="stat-num">{dados.following}</span>
              <span className="stat-label">Seguindo</span>
            </div>
            <div className="stat">
              <span className="stat-num">{dados.public_repos}</span>
              <span className="stat-label">Repositorios</span>
            </div>
          </div>
          {linguagens.length > 0 && (
            <div className="repos">
              <h3 className="repos-title">Linguagens mais usadas</h3>
              <div className="lang-barra-total">
                {linguagens.map((l) => (
                  <div
                    key={l.lang}
                    className="lang-barra-segmento"
                    style={{ width: l.percent + "%", background: l.cor }}
                    title={l.lang + " " + l.percent + "%"}
                  />
                ))}
              </div>
              <div className="lang-lista">
                {linguagens.map((l) => (
                  <div key={l.lang} className="lang-item">
                    <span className="lang-dot" style={{ background: l.cor }} />
                    <span className="lang-nome">{l.lang}</span>
                    <span className="lang-percent">{l.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {repos.length > 0 && (
            <div className="repos">
              <h3 className="repos-title">Repositorios recentes</h3>
              <div className="repos-grid">
                {repos.map((repo) => (
                  <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="repo-card">
                    <span className="repo-name">{repo.name}</span>
                    <span className="repo-desc">{repo.description || "Sem descricao"}</span>
                    <span className="repo-stars">★ {repo.stargazers_count}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
