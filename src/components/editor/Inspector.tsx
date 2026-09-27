'use client';

import type {
  AnimIn,
  AnimOut,
  BubbleEffect,
  BubbleStyle,
  Decoration,
  DecorationAnim,
  GeneralSettings,
  NameTagStyle,
  RoleTagStyle,
  ShapeKind,
  StyleKey,
  TagStyle,
} from '@/types/overlay';
import { isEventKey, EVENT_KEYS, MESSAGE_KEYS } from '@/types/overlay';
import { LABELS } from '@/lib/config/defaults';
import {
  ColorInput,
  FillInput,
  FontInput,
  Grid,
  IconButton,
  NumberInput,
  Row,
  Section,
  Segmented,
  Select,
  ShadowInput,
  Slider,
  StickerPicker,
  TextInput,
  TextStyleInput,
  Toggle,
} from './controls';

type Change = (fn: (s: BubbleStyle) => void, coalesce?: string) => void;

/* ------------------------------ bubble ------------------------------ */

export function BubbleInspector({ style, styleKey, change, onCopyFrom }: { style: BubbleStyle; styleKey: StyleKey; change: Change; onCopyFrom: (from: StyleKey) => void }) {
  const isEvent = isEventKey(styleKey);
  const c = (key: string) => (fn: (s: BubbleStyle) => void) => change(fn, key);
  const linked = style.radius.every((r) => r === style.radius[0]);

  return (
    <>
      <Section title="Style">
        <Toggle
          label={isEvent ? 'Show this alert in chat' : 'Use a custom style for this role'}
          hint={isEvent ? undefined : 'When off, the Viewer style is used'}
          checked={style.enabled}
          onChange={(v) => change((s) => void (s.enabled = v))}
        />
        <Row label="Copy design from">
          <Select
            value={'' as string}
            onChange={(v) => v && onCopyFrom(v as StyleKey)}
            options={[
              { value: '', label: 'Choose a style…' },
              ...[...MESSAGE_KEYS, ...EVENT_KEYS].filter((k) => k !== styleKey).map((k) => ({ value: k, label: LABELS[k] })),
            ]}
          />
        </Row>
      </Section>

      {isEvent && (
        <Section title="Alert text">
          <Row label="Title" hint="{name} {amount} {months} {tier} {recipient}">
            <TextInput value={style.event.title} onChange={(v) => c('ev-title')((s) => void (s.event.title = v))} />
          </Row>
          <Row label="Subtitle">
            <TextInput value={style.event.subtitle} onChange={(v) => c('ev-sub')((s) => void (s.event.subtitle = v))} />
          </Row>
          <Toggle label="Show the attached message" checked={style.event.showMessage} onChange={(v) => change((s) => void (s.event.showMessage = v))} />
          <Section title="Title font" defaultOpen={false}>
            <TextStyleInput value={style.event.titleText} onChange={(v) => c('ev-tt')((s) => void (s.event.titleText = v))} />
          </Section>
          <Section title="Subtitle font" defaultOpen={false}>
            <TextStyleInput value={style.event.subtitleText} onChange={(v) => c('ev-st')((s) => void (s.event.subtitleText = v))} />
          </Section>
        </Section>
      )}

      <Section title="Shape">
        <Segmented<ShapeKind>
          value={style.shape}
          onChange={(v) => change((s) => void (s.shape = v))}
          options={[
            { value: 'rounded', label: 'Rounded' },
            { value: 'notched', label: 'Notched' },
            { value: 'slanted', label: 'Slanted' },
          ]}
        />
        {style.shape === 'rounded' &&
          (linked ? (
            <Slider label="Corner radius" value={style.radius[0]} max={60} suffix="px" onChange={(v) => c('radius')((s) => void (s.radius = [v, v, v, v]))} />
          ) : (
            <Grid cols={4}>
              {(['↖', '↗', '↘', '↙'] as const).map((l, i) => (
                <Row key={l} label={l}>
                  <NumberInput value={style.radius[i]} min={0} onChange={(v) => c(`radius${i}`)((s) => void (s.radius[i] = v))} />
                </Row>
              ))}
            </Grid>
          ))}
        {style.shape === 'rounded' && (
          <Toggle
            label="Separate corners"
            checked={!linked}
            onChange={(v) => change((s) => void (s.radius = v ? [s.radius[0], s.radius[0], s.radius[0], Math.max(0, s.radius[0] - 8)] : [s.radius[0], s.radius[0], s.radius[0], s.radius[0]]))}
          />
        )}
        {style.shape !== 'rounded' && (
          <Slider label={style.shape === 'notched' ? 'Notch size' : 'Slant'} value={style.cut} max={40} suffix="px" onChange={(v) => c('cut')((s) => void (s.cut = v))} />
        )}
        <Grid>
          <Row label="Min width">
            <NumberInput value={style.minWidth} min={0} suffix="px" onChange={(v) => c('minw')((s) => void (s.minWidth = v))} />
          </Row>
          <Row label="Max width">
            <NumberInput value={style.maxWidth} min={40} suffix="px" onChange={(v) => c('maxw')((s) => void (s.maxWidth = v))} />
          </Row>
        </Grid>
        <Row label="Padding (top, right, bottom, left)">
          <Grid cols={4}>
            {[0, 1, 2, 3].map((i) => (
              <NumberInput key={i} value={style.padding[i]} min={0} onChange={(v) => c(`pad${i}`)((s) => void (s.padding[i] = v))} />
            ))}
          </Grid>
        </Row>
        <Row label="Outer space (top, bottom)" hint="room for floating tags">
          <Grid>
            {[0, 1].map((i) => (
              <NumberInput key={i} value={style.margin[i]} min={0} onChange={(v) => c(`mar${i}`)((s) => void (s.margin[i] = v))} />
            ))}
          </Grid>
        </Row>
      </Section>

      <Section title="Background">
        <FillInput value={style.fill} onChange={(v) => c('fill')((s) => void (s.fill = v))} />
        <Row label="Background image URL" hint="optional">
          <TextInput value={style.bgImage} placeholder="https://…" onChange={(v) => c('bgimg')((s) => void (s.bgImage = v))} />
        </Row>
      </Section>

      <Section title="Border" defaultOpen={style.borderWidth > 0}>
        <Slider label="Width" value={style.borderWidth} max={8} step={0.5} suffix="px" onChange={(v) => c('bw')((s) => void (s.borderWidth = v))} />
        {style.borderWidth > 0 && (
          <>
            <Toggle
              label="Gradient border"
              checked={!!style.borderFill}
              onChange={(v) => change((s) => void (s.borderFill = v ? { type: 'linear', color: s.borderColor, color2: '#ffffff', angle: 90 } : null))}
            />
            {style.borderFill ? (
              <FillInput value={style.borderFill} onChange={(v) => c('bfill')((s) => void (s.borderFill = v))} />
            ) : (
              <ColorInput value={style.borderColor} onChange={(v) => c('bc')((s) => void (s.borderColor = v))} />
            )}
          </>
        )}
      </Section>

      <Section title="Shadow & effects">
        <ShadowInput value={style.shadow} onChange={(v) => c('shadow')((s) => void (s.shadow = v))} />
        <Row label="Animated effect">
          <Select<BubbleEffect>
            value={style.effect}
            onChange={(v) => change((s) => void (s.effect = v))}
            options={[
              { value: 'none', label: 'None' },
              { value: 'glow', label: 'Glow' },
              { value: 'shine', label: 'Shine sweep' },
              { value: 'pulse', label: 'Pulse' },
              { value: 'float', label: 'Float' },
            ]}
          />
        </Row>
        {(style.effect === 'glow' || style.effect === 'pulse') && (
          <ColorInput label="Effect color" value={style.effectColor} onChange={(v) => c('fxc')((s) => void (s.effectColor = v))} />
        )}
        <Toggle label="Offset back layer" hint="A second shape behind the bubble" checked={style.backLayer.enabled} onChange={(v) => change((s) => void (s.backLayer.enabled = v))} />
        {style.backLayer.enabled && (
          <div className="space-y-2 pl-3 border-l border-white/10">
            <ColorInput value={style.backLayer.color} onChange={(v) => c('blc')((s) => void (s.backLayer.color = v))} />
            <Grid>
              <Row label="Offset X">
                <NumberInput value={style.backLayer.x} onChange={(v) => c('blx')((s) => void (s.backLayer.x = v))} />
              </Row>
              <Row label="Offset Y">
                <NumberInput value={style.backLayer.y} onChange={(v) => c('bly')((s) => void (s.backLayer.y = v))} />
              </Row>
            </Grid>
          </div>
        )}
      </Section>

      <Section title={isEvent ? 'Message text' : 'Text'}>
        <TextStyleInput value={style.text} onChange={(v) => c('text')((s) => void (s.text = v))} />
      </Section>
    </>
  );
}

/* -------------------------------- tags -------------------------------- */

function TagFields<T extends TagStyle>({ tag, update, isRole }: { tag: T; update: (fn: (t: T) => void, key?: string) => void; isRole?: boolean }) {
  return (
    <>
      <Section title="Placement">
        <Segmented
          value={tag.placement}
          onChange={(v) => update((t) => void (t.placement = v))}
          options={[
            { value: 'floating', label: 'Floating' },
            ...(isRole ? [{ value: 'withName' as const, label: 'Next to name' }] : []),
            { value: 'inline', label: 'In text' },
          ]}
        />
        {tag.placement === 'floating' && (
          <Grid>
            <Row label="X" hint="% of bubble">
              <NumberInput value={tag.pos.x} step={0.5} onChange={(v) => update((t) => void (t.pos.x = v), 'px')} />
            </Row>
            <Row label="Y" hint="% of bubble">
              <NumberInput value={tag.pos.y} step={0.5} onChange={(v) => update((t) => void (t.pos.y = v), 'py')} />
            </Row>
          </Grid>
        )}
      </Section>
      <Section title="Background">
        <FillInput value={tag.fill} onChange={(v) => update((t) => void (t.fill = v), 'fill')} />
        <Grid cols={3}>
          <Row label="Radius">
            <NumberInput value={tag.radius} min={0} onChange={(v) => update((t) => void (t.radius = v), 'rad')} />
          </Row>
          <Row label="Pad X">
            <NumberInput value={tag.padX} min={0} onChange={(v) => update((t) => void (t.padX = v), 'padx')} />
          </Row>
          <Row label="Pad Y">
            <NumberInput value={tag.padY} min={0} onChange={(v) => update((t) => void (t.padY = v), 'pady')} />
          </Row>
        </Grid>
        <Slider label="Border" value={tag.borderWidth} max={6} step={0.5} suffix="px" onChange={(v) => update((t) => void (t.borderWidth = v), 'bw')} />
        {tag.borderWidth > 0 && <ColorInput value={tag.borderColor} onChange={(v) => update((t) => void (t.borderColor = v), 'bc')} />}
        <ShadowInput value={tag.shadow} onChange={(v) => update((t) => void (t.shadow = v), 'sh')} />
      </Section>
      <Section title="Text">
        <TextStyleInput value={tag.text} showAlign={false} onChange={(v) => update((t) => void (t.text = v), 'text')} />
      </Section>
      <Section title="Icon" defaultOpen={!!tag.icon}>
        <StickerPicker value={tag.icon} allowNone onChange={(v) => update((t) => void (t.icon = v))} />
        {tag.icon && <ColorInput label="Icon color" value={tag.iconColor} onChange={(v) => update((t) => void (t.iconColor = v), 'ic')} />}
      </Section>
    </>
  );
}

export function NameInspector({ style, change }: { style: BubbleStyle; change: Change }) {
  const update = (fn: (t: NameTagStyle) => void, key?: string) => change((s) => fn(s.name), key && `name-${key}`);
  const n = style.name;
  return (
    <>
      <Section title="Name tag">
        <Toggle label="Show name tag" checked={n.visible} onChange={(v) => update((t) => void (t.visible = v))} />
        <Toggle label="Use the viewer's Twitch color" checked={n.useUserColor} onChange={(v) => update((t) => void (t.useUserColor = v))} />
        <Toggle label="Avatar" checked={n.showAvatar} onChange={(v) => update((t) => void (t.showAvatar = v))} />
        <Toggle label="Twitch badges" checked={n.showBadges} onChange={(v) => update((t) => void (t.showBadges = v))} />
        <Toggle label="Pronouns" hint="from pronouns.alejo.io" checked={n.showPronouns} onChange={(v) => update((t) => void (t.showPronouns = v))} />
      </Section>
      <TagFields tag={n} update={update} />
    </>
  );
}

export function RoleInspector({ style, change }: { style: BubbleStyle; change: Change }) {
  const update = (fn: (t: RoleTagStyle) => void, key?: string) => change((s) => fn(s.role), key && `role-${key}`);
  const r = style.role;
  return (
    <>
      <Section title="Role tag">
        <Toggle label="Show role tag" checked={r.visible} onChange={(v) => update((t) => void (t.visible = v))} />
        <Row label="Label" hint="empty = icon only">
          <TextInput value={r.label} onChange={(v) => update((t) => void (t.label = v), 'label')} />
        </Row>
        <Toggle label="Speech tail" checked={r.tail} onChange={(v) => update((t) => void (t.tail = v))} />
      </Section>
      <TagFields tag={r} update={update} isRole />
    </>
  );
}

/* ----------------------------- decoration ----------------------------- */

export function DecorationInspector({
  deco,
  update,
  onDelete,
  onDuplicate,
  onOrder,
}: {
  deco: Decoration;
  update: (fn: (d: Decoration) => void, key?: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOrder: (dir: 1 | -1) => void;
}) {
  const isLine = deco.kind === 'line';
  return (
    <>
      <Section
        title={isLine ? 'Line' : deco.kind === 'sticker' ? 'Sticker' : deco.kind === 'emoji' ? 'Emoji' : 'Image'}
        right={
          <div className="flex gap-1">
            <IconButton title="Bring forward" onClick={() => onOrder(1)}>↑</IconButton>
            <IconButton title="Send backward" onClick={() => onOrder(-1)}>↓</IconButton>
            <IconButton title="Duplicate (Ctrl+D)" onClick={onDuplicate}>⧉</IconButton>
            <IconButton title="Delete (Del)" onClick={onDelete} danger>✕</IconButton>
          </div>
        }
      >
        {deco.kind === 'sticker' && <StickerPicker value={deco.value as never} onChange={(v) => v && update((d) => void (d.value = v))} />}
        {deco.kind === 'emoji' && (
          <Row label="Emoji or text">
            <TextInput value={deco.value} onChange={(v) => update((d) => void (d.value = v), 'val')} />
          </Row>
        )}
        {deco.kind === 'image' && (
          <Row label="Image URL" hint="PNG / GIF / WebP / SVG">
            <TextInput value={deco.value} placeholder="https://…" onChange={(v) => update((d) => void (d.value = v), 'val')} />
          </Row>
        )}
        <Segmented
          value={deco.attach}
          onChange={(v) => update((d) => void (d.attach = v))}
          options={[
            { value: 'bubble', label: 'Attach to bubble' },
            { value: 'name', label: 'Attach to name' },
          ]}
        />
        <Toggle label="Behind the bubble" checked={deco.behind} onChange={(v) => update((d) => void (d.behind = v))} />
      </Section>

      <Section title="Transform">
        <Grid>
          <Row label="X" hint="%">
            <NumberInput value={deco.pos.x} step={0.5} onChange={(v) => update((d) => void (d.pos.x = v), 'x')} />
          </Row>
          <Row label="Y" hint="%">
            <NumberInput value={deco.pos.y} step={0.5} onChange={(v) => update((d) => void (d.pos.y = v), 'y')} />
          </Row>
        </Grid>
        <Slider label={isLine ? 'Length' : 'Size'} value={deco.size} min={isLine ? 5 : 4} max={isLine ? 100 : 160} suffix={isLine ? '%' : 'px'} onChange={(v) => update((d) => void (d.size = v), 'size')} />
        {!isLine && <Slider label="Rotation" value={deco.rotate} min={-180} max={180} suffix="°" onChange={(v) => update((d) => void (d.rotate = v), 'rot')} />}
        {!isLine && <Toggle label="Mirror" checked={deco.flip} onChange={(v) => update((d) => void (d.flip = v))} />}
        <Slider label="Opacity" value={Math.round(deco.opacity * 100)} suffix="%" onChange={(v) => update((d) => void (d.opacity = v / 100), 'op')} />
      </Section>

      {(deco.kind === 'sticker' || isLine) && (
        <Section title="Colors">
          <ColorInput label={isLine ? 'Color' : 'Main'} value={deco.color} onChange={(v) => update((d) => void (d.color = v), 'c1')} />
          {!isLine && <ColorInput label="Accent" value={deco.color2} onChange={(v) => update((d) => void (d.color2 = v), 'c2')} />}
        </Section>
      )}

      {isLine && (
        <Section title="Line">
          <Toggle label="Vertical" checked={deco.vertical} onChange={(v) => update((d) => void (d.vertical = v))} />
          <Slider label="Thickness" value={deco.thickness} min={0.5} max={10} step={0.5} suffix="px" onChange={(v) => update((d) => void (d.thickness = v), 'th')} />
          <Segmented
            value={deco.lineStyle}
            onChange={(v) => update((d) => void (d.lineStyle = v))}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ]}
          />
        </Section>
      )}

      <Section title="Animation">
        <Select<DecorationAnim>
          value={deco.anim}
          onChange={(v) => update((d) => void (d.anim = v))}
          options={[
            { value: 'none', label: 'None' },
            { value: 'float', label: 'Float' },
            { value: 'bounce', label: 'Bounce' },
            { value: 'sway', label: 'Sway' },
            { value: 'spin', label: 'Spin' },
            { value: 'pulse', label: 'Pulse' },
            { value: 'twinkle', label: 'Twinkle' },
          ]}
        />
        {deco.anim !== 'none' && <Slider label="Delay" value={deco.animDelay} max={3} step={0.1} suffix="s" onChange={(v) => update((d) => void (d.animDelay = v), 'delay')} />}
      </Section>
    </>
  );
}

/* ------------------------------ general ------------------------------ */

export function GeneralInspector({ general, update }: { general: GeneralSettings; update: (fn: (g: GeneralSettings) => void, key?: string) => void }) {
  return (
    <>
      <Section title="Messages">
        <Grid>
          <Row label="Lifetime" hint="0 = forever">
            <NumberInput value={general.lifetime} min={0} suffix="s" onChange={(v) => update((g) => void (g.lifetime = v), 'life')} />
          </Row>
          <Row label="Max on screen">
            <NumberInput value={general.limit} min={1} onChange={(v) => update((g) => void (g.limit = v), 'limit')} />
          </Row>
        </Grid>
        <Toggle label="Hide !commands" checked={general.hideCommands} onChange={(v) => update((g) => void (g.hideCommands = v))} />
        <Row label="Hidden users" hint="bots, one per line">
          <TextInput
            multiline
            value={general.exclude.join('\n')}
            onChange={(v) => update((g) => void (g.exclude = v.split(/[\s,]+/).map((x) => x.trim().toLowerCase()).filter(Boolean)), 'excl')}
          />
        </Row>
      </Section>

      <Section title="Layout">
        <Row label="Newest message">
          <Segmented
            value={general.stack}
            onChange={(v) => update((g) => void (g.stack = v))}
            options={[
              { value: 'bottom', label: 'At the bottom' },
              { value: 'top', label: 'At the top' },
            ]}
          />
        </Row>
        <Row label="Alignment">
          <Segmented
            value={general.align}
            onChange={(v) => update((g) => void (g.align = v))}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </Row>
        <Grid cols={3}>
          <Row label="Gap">
            <NumberInput value={general.gap} min={0} onChange={(v) => update((g) => void (g.gap = v), 'gap')} />
          </Row>
          <Row label="Padding">
            <NumberInput value={general.padding} min={0} onChange={(v) => update((g) => void (g.padding = v), 'pad')} />
          </Row>
          <Row label="Emote size">
            <NumberInput value={general.emoteSize} min={10} onChange={(v) => update((g) => void (g.emoteSize = v), 'emote')} />
          </Row>
        </Grid>
        <Slider label="Scale" value={general.scale} min={0.5} max={2.5} step={0.05} suffix="×" onChange={(v) => update((g) => void (g.scale = v), 'scale')} />
      </Section>

      <Section title="Font">
        <FontInput value={general.font} onChange={(v) => update((g) => void (g.font = v), 'font')} />
      </Section>

      <Section title="Animations">
        <Grid>
          <Row label="Appear">
            <Select<AnimIn>
              value={general.animIn}
              onChange={(v) => update((g) => void (g.animIn = v))}
              options={[
                { value: 'slide-up', label: 'Slide up' },
                { value: 'slide-left', label: 'From left' },
                { value: 'slide-right', label: 'From right' },
                { value: 'drop', label: 'Drop' },
                { value: 'pop', label: 'Pop' },
                { value: 'fade', label: 'Fade' },
                { value: 'none', label: 'None' },
              ]}
            />
          </Row>
          <Row label="Disappear">
            <Select<AnimOut>
              value={general.animOut}
              onChange={(v) => update((g) => void (g.animOut = v))}
              options={[
                { value: 'fade', label: 'Fade' },
                { value: 'slide-right', label: 'To right' },
                { value: 'slide-left', label: 'To left' },
                { value: 'rise', label: 'Rise' },
                { value: 'shrink', label: 'Shrink' },
                { value: 'none', label: 'None' },
              ]}
            />
          </Row>
        </Grid>
        <Slider label="Duration" value={general.animDuration} min={100} max={2000} step={50} suffix="ms" onChange={(v) => update((g) => void (g.animDuration = v), 'dur')} />
      </Section>
    </>
  );
}
