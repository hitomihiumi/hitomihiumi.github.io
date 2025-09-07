export interface TwitchMessage {
  message: string;
  tags: {
    [key: string]: any;
    'display-name'?: string;
    username: string;
    color?: string;
    badges?: { [key: string]: string };
    emotes?: { [key: string]: string[] };
    'msg-id'?: string;
    id?: string;
    mod?: boolean;
  };
  displaying: boolean;
  expired: boolean;
  dead: boolean;
  id?: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

export interface Badge {
  id: string;
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
  title: string;
  description: string;
  click_action?: string;
  click_url?: string;
}

export interface BadgeSet {
  set_id: string;
  versions: Badge[];
}

export interface ChatSettings {
  scroll?: boolean;
  nocommand?: boolean;
  lifetime?: number;
  exclude?: string;
  oauth?: string;
  channel?: string;
  limit?: number; // лимит сообщений на экране
}
