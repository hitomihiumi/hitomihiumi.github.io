'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import type {
  BubbleStyle,
  Decoration,
  Fill,
  GeneralSettings,
  NameTagStyle,
  ShadowStyle,
  TagStyle,
  TextStyle,
} from '@/types/overlay';
import { Sticker } from '@/lib/stickers';
import { fontStack } from '@/lib/fonts';
import { fillTemplate, isEmoteOnly, Token } from '@/lib/parse';

export interface BubbleData {
  name: string;
  /** Twitch name color */
  color?: string;
  avatar?: string;
  badges?: string[];
  pronouns?: string;
  tokens: Token[];
  /** values for `{placeholders}` in event templates */
  vars?: Record<string, string | number | undefined>;
}

interface BubbleProps {
  style: BubbleStyle;
  general: GeneralSettings;
  data: BubbleData;
  isEvent?: boolean;
  /** editor mode: shows hover/selection outlines and decoration handles */
  editable?: boolean;
  /** `bubble`, `name`, `role` or a decoration id */
  selected?: string | null;
}

/* ------------------------------ helpers ------------------------------ */

export const fillCss = (f: Fill): string => {
  if (f.type === 'linear') return `linear-gradient(${f.angle}deg, ${f.color}, ${f.color2})`;
  if (f.type === 'radial') return `radial-gradient(circle at 30% 30%, ${f.color}, ${f.color2})`;
  return f.color;
};

const shadowCss = (s: ShadowStyle) => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`;

const textCss = (t: TextStyle, fallbackFont?: string): CSSProperties => ({
  fontFamily: fontStack(t.font) ?? fallbackFont,
  fontSize: t.size,
  fontWeight: t.weight,
  color: t.color,
  textAlign: t.align,
  textTransform: t.uppercase ? 'uppercase' : undefined,
  letterSpacing: t.letterSpacing ? `${t.letterSpacing}px` : undefined,
  textShadow: t.shadow.enabled ? shadowCss(t.shadow) : undefined,
});

/** Tags keep the side closest to the bubble edge fixed, so long names grow inwards. */
const anchoredCss = (x: number, y: number): CSSProperties => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  transform: `translate(${-Math.min(100, Math.max(0, x))}%, -50%)`,
});

const notchMask = (r: number) => {
  const g = (at: string) => `radial-gradient(circle at ${at}, transparent ${r}px, #000 ${r + 0.5}px)`;
  return [
    `${g('top left')} top left / 51% 51% no-repeat`,
    `${g('top right')} top right / 51% 51% no-repeat`,
    `${g('bottom right')} bottom right / 51% 51% no-repeat`,
    `${g('bottom left')} bottom left / 51% 51% no-repeat`,
  ].join(', ');
};

/** Clip / mask / radius that give a layer the bubble's outline. */
function shapeCss(style: BubbleStyle, inset = 0): CSSProperties {
  if (style.shape === 'notched') {
    const mask = notchMask(style.cut);
    return { WebkitMask: mask, mask };
  }
  if (style.shape === 'slanted') {
    const c = Math.max(0, style.cut - inset / 2);
    return { clipPath: `polygon(${c}px 0, 100% 0, calc(100% - ${c}px) 100%, 0 100%)` };
  }
  return { borderRadius: style.radius.map((r) => `${Math.max(0, r - inset)}px`).join(' ') };
}

/* ---------------------------- decorations ---------------------------- */

function DecorationView({ d, editable, selected }: { d: Decoration; editable?: boolean; selected?: boolean }) {
  let inner: ReactNode;
  let box: CSSProperties = {};
  if (d.kind === 'line') {
    const line: CSSProperties = { borderColor: d.color, borderStyle: d.lineStyle };
    if (d.vertical) {
      box = { height: `${d.size}%`, width: 0 };
      inner = <div style={{ ...line, height: '100%', borderLeftWidth: d.thickness, borderTop: 0, borderRight: 0, borderBottom: 0 }} />;
    } else {
      box = { width: `${d.size}%`, height: 0 };
      inner = <div style={{ ...line, width: '100%', borderTopWidth: d.thickness, borderLeft: 0, borderRight: 0, borderBottom: 0 }} />;
    }
  } else if (d.kind === 'emoji') {
    inner = <span style={{ fontSize: d.size, lineHeight: 1, display: 'block' }}>{d.value}</span>;
  } else if (d.kind === 'image') {
    inner = d.value ? (
      <img src={d.value} alt="" draggable={false} style={{ width: d.size, height: 'auto', display: 'block' }} />
    ) : (
      <div style={{ width: d.size, height: d.size, border: '1px dashed #fff8', borderRadius: 4 }} />
    );
  } else {
    inner = <Sticker kind={d.value as never} color={d.color} color2={d.color2} size={d.size} />;
  }

  return (
    <div
      data-deco={d.id}
      className={`cb-deco ${editable ? 'cb-editable' : ''} ${selected ? 'cb-selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${d.pos.x}%`,
        top: `${d.pos.y}%`,
        transform: `translate(-50%, -50%) rotate(${d.rotate}deg) scaleX(${d.flip ? -1 : 1})`,
        opacity: d.opacity,
        zIndex: d.behind ? 0 : 4,
        pointerEvents: editable ? 'auto' : 'none',
        ...box,
      }}
    >
      <div
        className={d.anim !== 'none' ? `cb-anim-${d.anim}` : undefined}
        style={{ animationDelay: `${d.animDelay}s`, width: '100%', height: '100%' }}
      >
        {inner}
      </div>
      {editable && selected && (
        <>
          <span data-handle="resize" className="cb-handle cb-handle-resize" />
          {d.kind !== 'line' && <span data-handle="rotate" className="cb-handle cb-handle-rotate" />}
        </>
      )}
    </div>
  );
}

/* -------------------------------- tags -------------------------------- */

function TagPill({
  tag,
  children,
  font,
  colorOverride,
  tail,
}: {
  tag: TagStyle;
  children: ReactNode;
  font?: string;
  colorOverride?: string;
  tail?: boolean;
}) {
  const t = textCss(tag.text, font);
  return (
    <div
      className="cb-pill"
      style={{
        ...t,
        color: colorOverride ?? t.color,
        background: fillCss(tag.fill),
        borderRadius: tag.radius,
        padding: `${tag.padY}px ${tag.padX}px`,
        border: tag.borderWidth ? `${tag.borderWidth}px solid ${tag.borderColor}` : undefined,
        boxShadow: tag.shadow.enabled ? shadowCss(tag.shadow) : undefined,
      }}
    >
      {tag.icon && <Sticker kind={tag.icon} color={tag.iconColor} color2={tag.fill.color} size="1.1em" />}
      {children}
      {tail && <span className="cb-tail" style={{ background: tag.fill.color2 || tag.fill.color }} />}
    </div>
  );
}

function NameContent({ name, data }: { name: NameTagStyle; data: BubbleData }) {
  return (
    <>
      {name.showAvatar && data.avatar && <img className="cb-avatar" src={data.avatar} alt="" draggable={false} />}
      {name.showBadges &&
        data.badges?.map((b, i) => <img key={i} className="cb-badge" src={b} alt="" draggable={false} />)}
      <span className="cb-name-text">{data.name}</span>
      {name.showPronouns && data.pronouns && <span className="cb-pronouns">{data.pronouns}</span>}
    </>
  );
}

/* ------------------------------- emotes ------------------------------- */

/** Emote image that falls back to its name when the image can't be loaded. */
function EmoteImg({ url, name, className }: { url: string; name: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span>{name}</span>;
  return <img className={className} src={url} alt={name} title={name} draggable={false} onError={() => setFailed(true)} />;
}

function Emote({ token }: { token: Extract<Token, { type: 'emote' }> }) {
  if (!token.overlays?.length) return <EmoteImg className="cb-emote" url={token.url} name={token.name} />;
  return (
    <span className="cb-emote-stack">
      <EmoteImg className="cb-emote" url={token.url} name={token.name} />
      {token.overlays.map((o, i) => (
        <EmoteImg key={i} className="cb-emote cb-emote-overlay" url={o.url} name={o.name} />
      ))}
    </span>
  );
}

/* ------------------------------- bubble ------------------------------- */

export default function Bubble({ style, general, data, isEvent, editable, selected }: BubbleProps) {
  const font = fontStack(general.font);
  const nameColor = style.name.useUserColor && data.color ? data.color : undefined;
  const cls = (id: string) => `${editable ? 'cb-editable' : ''} ${selected === id ? 'cb-selected' : ''}`;

  const nameDecos = style.decorations.filter((d) => d.attach === 'name');
  const bodyDecos = style.decorations.filter((d) => d.attach !== 'name');

  const showName = style.name.visible;
  const showRole = style.role.visible && (!!style.role.label || !!style.role.icon);
  const floatingName = showName && style.name.placement !== 'inline';
  const roleWithName = showRole && floatingName && style.role.placement === 'withName';
  const floatingRole = showRole && style.role.placement === 'floating';
  const inlineRole = showRole && !floatingRole && !roleWithName;

  const nameTag = (
    <TagPill tag={style.name} font={font} colorOverride={nameColor}>
      <NameContent name={style.name} data={data} />
    </TagPill>
  );
  const roleTag = (tail: boolean) => (
    <TagPill tag={style.role} font={font} tail={tail}>
      {style.role.label && <span>{fillTemplate(style.role.label, data.vars ?? {})}</span>}
    </TagPill>
  );

  const hasShadow = style.shadow.enabled;
  const shapeVars = {
    '--cb-shadow': hasShadow ? shadowCss(style.shadow) : '0 0 0 transparent',
    '--cb-fx': style.effectColor,
    '--cb-emote': `${general.emoteSize}px`,
  } as CSSProperties;

  const bw = style.borderWidth;
  const fillBg = [style.bgImage ? `url("${style.bgImage}") center / cover` : '', fillCss(style.fill)]
    .filter(Boolean)
    .join(', ');

  const vars = { name: data.name, ...(data.vars ?? {}) };
  const messageText = (
    <span className={`cb-message ${isEmoteOnly(data.tokens) ? 'cb-emote-only' : ''}`}>
      {data.tokens.map((t, i) =>
        t.type === 'emote' ? (
          <Emote key={i} token={t} />
        ) : t.type === 'mention' ? (
          <span key={i} className="cb-mention">
            {t.text}
          </span>
        ) : (
          <span key={i}>{t.text}</span>
        ),
      )}
    </span>
  );

  return (
    <div
      className="cb-root"
      style={{ paddingTop: style.margin[0], paddingBottom: style.margin[1], ...shapeVars }}
    >
      <div
        data-el="bubble"
        className={`cb-body cb-fx-${style.effect} ${cls('bubble')}`}
        style={{ '--cb-min': `${style.minWidth}px`, '--cb-max': `${style.maxWidth}px` } as CSSProperties}
      >
        {bodyDecos
          .filter((d) => d.behind)
          .map((d) => (
            <DecorationView key={d.id} d={d} editable={editable} selected={selected === d.id} />
          ))}

        {style.backLayer.enabled && (
          <div
            className="cb-layer"
            style={{
              ...shapeCss(style),
              background: style.backLayer.color,
              transform: `translate(${style.backLayer.x}px, ${style.backLayer.y}px)`,
              zIndex: 1,
            }}
          />
        )}

        <div className="cb-shape">
          {bw > 0 && (
            <div
              className="cb-layer"
              style={{ ...shapeCss(style), background: style.borderFill ? fillCss(style.borderFill) : style.borderColor }}
            />
          )}
          <div className="cb-layer cb-fill" style={{ ...shapeCss(style, bw), inset: bw, background: fillBg }}>
            {style.effect === 'shine' && <div className="cb-shine" />}
          </div>
        </div>

        <div
          className="cb-content"
          style={{
            padding: style.padding.map((p) => `${p}px`).join(' '),
            ...textCss(style.text, font),
          }}
        >
          {isEvent ? (
            <>
              {style.event.title && (
                <div style={textCss(style.event.titleText, font)} className="cb-event-title">
                  {fillTemplate(style.event.title, vars)}
                </div>
              )}
              {style.event.subtitle && (
                <div style={textCss(style.event.subtitleText, font)}>{fillTemplate(style.event.subtitle, vars)}</div>
              )}
              {style.event.showMessage && data.tokens.length > 0 && <div className="cb-event-message">{messageText}</div>}
            </>
          ) : (
            <>
              {inlineRole && (
                <span data-el="role" className={`cb-inline-tag ${cls('role')}`}>
                  {roleTag(false)}
                </span>
              )}
              {showName && !floatingName && (
                <span data-el="name" className={`cb-inline-tag ${cls('name')}`}>
                  {nameTag}
                </span>
              )}
              {messageText}
            </>
          )}
        </div>

        {bodyDecos
          .filter((d) => !d.behind)
          .map((d) => (
            <DecorationView key={d.id} d={d} editable={editable} selected={selected === d.id} />
          ))}

        {floatingName && (
          <div
            data-el="name"
            className={`cb-tag ${cls('name')}`}
            style={{ ...anchoredCss(style.name.pos.x, style.name.pos.y), zIndex: 6 }}
          >
            {nameDecos
              .filter((d) => d.behind)
              .map((d) => (
                <DecorationView key={d.id} d={d} editable={editable} selected={selected === d.id} />
              ))}
            <div className="cb-name-row">
              {roleWithName && (
                <span data-el="role" className={cls('role')}>
                  {roleTag(false)}
                </span>
              )}
              {nameTag}
            </div>
            {nameDecos
              .filter((d) => !d.behind)
              .map((d) => (
                <DecorationView key={d.id} d={d} editable={editable} selected={selected === d.id} />
              ))}
          </div>
        )}

        {floatingRole && (
          <div
            data-el="role"
            className={`cb-tag ${cls('role')}`}
            style={{ ...anchoredCss(style.role.pos.x, style.role.pos.y), zIndex: 5 }}
          >
            {roleTag(style.role.tail)}
          </div>
        )}
      </div>
    </div>
  );
}
