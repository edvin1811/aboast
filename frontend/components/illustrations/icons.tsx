import {
  BarChart3, Bell, Calendar, CalendarCheck2, Camera, CheckCircle2, ClipboardList, Clock3, Code2, Eye, Gift, Globe, Heart, Image as ImageIcon,
  Inbox, Layers, LayoutGrid, Lightbulb, Link2, Mail, Megaphone, MessageCircle, Mic, PenLine, Phone, Quote, Repeat2, Search, Send,
  ShieldCheck, ShoppingBag, Smartphone, Sparkles, Star, Store, Tag, Target, ThumbsUp, TrendingUp, Users, Video, Zap, type LucideIcon,
} from "lucide-react";

/** Icons a blog illustration spec can name. */
export const ICONS: Record<string, LucideIcon> = {
  chart: BarChart3, bell: Bell, calendar: Calendar, scheduled: CalendarCheck2, camera: Camera, check: CheckCircle2, form: ClipboardList,
  clock: Clock3, code: Code2, eye: Eye, gift: Gift, globe: Globe, heart: Heart, image: ImageIcon, inbox: Inbox, layers: Layers,
  grid: LayoutGrid, idea: Lightbulb, link: Link2, mail: Mail, megaphone: Megaphone, comment: MessageCircle, mic: Mic, write: PenLine,
  call: Phone, quote: Quote, repeat: Repeat2, search: Search, send: Send, shield: ShieldCheck, bag: ShoppingBag, phone: Smartphone,
  sparkles: Sparkles, star: Star, store: Store, tag: Tag, target: Target, thumbs: ThumbsUp, trend: TrendingUp, users: Users,
  video: Video, zap: Zap,
};

export function Icon({ name, size = 20, className }: { name?: string; size?: number; className?: string }) {
  const Glyph = (name && ICONS[name]) || Sparkles;
  return <Glyph size={size} strokeWidth={2} className={className} aria-hidden="true" />;
}
