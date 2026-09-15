'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type IconName =
  'arrow' | 'chevron' | 'grid' | 'help' | 'home' | 'plus' | 'search' | 'spark' | 'stack';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.45 2.45 0 0 1 4.65 1.1c0 1.65-2.35 1.85-2.35 3.35M12 16.8h.01" />
      </>
    ),
    home: (
      <>
        <path d="m4 10 8-6 8 6" />
        <path d="M6 9v10h12V9M10 19v-5h4v5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4 4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.35 5.65L19 10l-5.65 1.35L12 17l-1.35-5.65L5 10l5.65-1.35L12 3Z" />
        <path d="m19 16 .55 2.45L22 19l-2.45.55L19 22l-.55-2.45L16 19l2.45-.55L19 16Z" />
      </>
    ),
    stack: (
      <>
        <rect x="4" y="5" width="16" height="12" rx="2" />
        <path d="m7 20 2-3h8l2 3M8 9h8M8 13h5" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const projects = [
  { title: '夏日公路 · 片头分镜', meta: '刚刚编辑 · 8 个节点', tone: 'peach', tag: '制作中' },
  { title: '产品发布会 2025', meta: '昨天编辑 · 14 个节点', tone: 'blue', tag: '草稿' },
  { title: '城市声音采集计划', meta: '9 月 12 日编辑 · 6 个节点', tone: 'mint', tag: '已完成' },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const filteredProjects = useMemo(
    () => projects.filter((project) => project.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Caerov 首页">
          <span className="brand-mark">
            <span />
          </span>
          <span>caerov</span>
        </a>
        <nav className="side-nav" aria-label="主导航">
          <a className="nav-item nav-item-primary" href="#new-project">
            <span className="nav-icon">
              <Icon name="plus" size={17} />
            </span>
            新建项目
          </a>
          <a className="nav-item active" href="#top">
            <span className="nav-icon">
              <Icon name="home" size={17} />
            </span>
            首页
          </a>
        </nav>
        <div className="nav-group">
          <p className="nav-label">工作区</p>
          <a className="nav-item" href="#agent">
            <span className="nav-icon">
              <Icon name="spark" size={17} />
            </span>
            Caerov Agent
          </a>
          <a className="nav-item" href="#plugins">
            <span className="nav-icon">
              <Icon name="grid" size={17} />
            </span>
            Blender 插件
          </a>
          <a className="nav-item" href="#plugins">
            <span className="nav-icon">
              <Icon name="stack" size={17} />
            </span>
            LibTV Plugin
          </a>
        </div>
        <a className="nav-item help-link" href="#help">
          <span className="nav-icon">
            <Icon name="help" size={17} />
          </span>
          帮助与反馈
        </a>
      </aside>

      <section className="workspace" id="top">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <span />
            </span>
            <span>caerov</span>
          </div>
          <div className="topbar-spacer" />
          <button className="credits" type="button" aria-label="查看积分余额">
            <span className="credits-gem">✦</span> 2,480 积分
          </button>
          <button className="profile-button" type="button">
            <span className="avatar">林</span>
            <span className="profile-name">林默</span>
            <Icon name="chevron" size={15} />
          </button>
        </header>

        <div className="content">
          <section className="welcome" aria-labelledby="page-title">
            <h1 id="page-title">欢迎回来，林默</h1>
            <div className="welcome-decoration" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>

          <section className="quick-actions" id="new-project" aria-label="快速开始">
            <button className="new-canvas-card" type="button">
              <span className="card-icon">
                <Icon name="plus" size={21} />
              </span>
              <span className="card-copy">
                <strong>新建画布</strong>
              </span>
              <span className="card-arrow">
                <Icon name="arrow" size={18} />
              </span>
            </button>
            <div className="canvas-preview" aria-label="画布预览">
              <div className="preview-topline">
                <span>
                  <i /> Untitled canvas
                </span>
                <span className="preview-dots">•••</span>
              </div>
              <div className="preview-grid">
                <div className="preview-node preview-node-a">
                  <span className="node-dot" />
                  脚本灵感
                </div>
                <div className="preview-line line-one" />
                <div className="preview-node preview-node-b">
                  <span className="node-dot violet" />
                  视觉参考
                </div>
                <div className="preview-line line-two" />
                <div className="preview-node preview-node-c">
                  <span className="node-dot orange" />
                  成片输出
                </div>
                <div className="preview-cursor" />
              </div>
              <div className="preview-footer">
                <span>3 nodes</span>
                <span>100%</span>
              </div>
            </div>
          </section>

          <section className="agent-section" id="agent" aria-labelledby="agent-title">
            <div className="section-heading">
              <div className="heading-with-icon">
                <span className="spark-icon">
                  <Icon name="spark" size={18} />
                </span>
                <div>
                  <h2 id="agent-title">
                    Caerov Agent <span className="beta">BETA</span>
                  </h2>
                </div>
              </div>
              <a className="text-link" href="#plugins">
                Skills <Icon name="arrow" size={15} />
              </a>
            </div>
            <div className="agent-composer">
              <div className="composer-icon">
                <Icon name="spark" size={18} />
              </div>
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="描述你想做的内容，Agent 会帮你规划下一步..."
                aria-label="向 Caerov Agent 提问"
              />
              <button
                className="send-button"
                type="button"
                aria-label="发送给 Agent"
                disabled={!prompt.trim()}
              >
                <Icon name="arrow" size={18} />
              </button>
            </div>
            <div className="suggestions">
              <button type="button" onClick={() => setPrompt('帮我做一个 30 秒的产品介绍视频')}>
                做一个产品介绍视频 <span>↗</span>
              </button>
              <button type="button" onClick={() => setPrompt('把这段脚本转换成分镜')}>
                把脚本转换成分镜 <span>↗</span>
              </button>
              <button type="button" onClick={() => setPrompt('生成一组适合社交媒体的视觉参考')}>
                生成视觉参考 <span>↗</span>
              </button>
            </div>
          </section>

          <section className="recent-section" id="projects" aria-labelledby="recent-title">
            <div className="section-heading recent-heading">
              <div>
                <h2 id="recent-title">最近项目</h2>
              </div>
              <a className="text-link" href="#projects">
                全部 <Icon name="arrow" size={15} />
              </a>
            </div>
            <label className="search-field">
              <Icon name="search" size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索项目"
                aria-label="搜索项目"
              />
            </label>
            <div className="project-grid">
              {filteredProjects.map((project) => (
                <a className="project-card" href="#new-project" key={project.title}>
                  <div className={`project-thumbnail ${project.tone}`}>
                    <span className="thumbnail-orb" />
                    <span className="thumbnail-grid" />
                  </div>
                  <div className="project-info">
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.meta}</p>
                    </div>
                    <span className="project-tag">{project.tag}</span>
                  </div>
                </a>
              ))}
              {filteredProjects.length === 0 && (
                <div className="empty-state">没有找到匹配的项目</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
