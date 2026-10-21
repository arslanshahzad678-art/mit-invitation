/**
 * Types & Data Model for MIT Invitations
 * Full Canva-style template engine, public invite links, RSVP, and guest portal
 */

export type ScreenElementKind = 
  | 'text'
  | 'image'
  | 'shape'
  | 'photo'
  | 'fieldText'
  | 'countdown'
  | 'scratch'
  | 'rsvp'
  | 'timeline'
  | 'map'
  | 'button'
  | 'music';

export type ActionType = 
  | 'goto'
  | 'playVideoThenGoto'
  | 'back'
  | 'openPopup'
  | 'toggleMusic'
  | 'openMap'
  | 'openRsvp'
  | 'openLink';

export interface Action {
  type: ActionType;
  targetPageId?: string;
  videoUrl?: string;
  popupTitle?: string;
  popupContent?: string;
  popupFieldKey?: string;
  mapUrl?: string;
  url?: string;
}

export type AnimationEntrance = 
  | 'none'
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'bounce'
  | 'flip'
  | 'wipe';

export type AnimationLoop = 
  | 'none'
  | 'float'
  | 'pulse'
  | 'shimmer'
  | 'sway';

export interface ScreenElement {
  id: string;
  kind: ScreenElementKind;
  name?: string;
  groupId?: string;

  // Geometry (based on 1080 x 1920 logical canvas)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees
  opacity?: number;  // 0 - 1
  flipX?: boolean;
  flipY?: boolean;
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;

  // Content
  content?: string;
  fieldKey?: string;     // links to TemplateField key
  imageUrl?: string;
  placeholder?: string;
  isUrdu?: boolean;

  // Typography & Styling
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  shrinkToFit?: boolean;

  // Shape & Frame
  shapeType?: 'rectangle' | 'rounded' | 'circle' | 'line' | 'heart' | 'star';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shadow?: string;
  frameUrl?: string;
  frameShape?: 'rectangle' | 'rounded' | 'circle' | 'oval' | 'arch' | 'heart';

  // Client Permissions
  clientEditable?: boolean;     // Client can change text/content in form
  clientFontEditable?: boolean; // Client can change font family

  // Interactivity
  action?: Action;

  // Animation configuration
  entranceAnimation?: AnimationEntrance;
  loopAnimation?: AnimationLoop;
  exitAnimation?: string;
  animationDelay?: number;      // seconds
  animationDuration?: number;   // seconds
  animationEasing?: string;
  animationTrigger?: 'pageOpen' | 'scroll';
}

export interface TemplatePage {
  id: string;
  name: string;
  order: number;
  isIntro?: boolean;            // Envelope / wax-seal page
  heightMode?: 'full' | 'scroll';
  customHeight?: number;        // e.g. 1920 or 3200 for scrolling pages
  backgroundType?: 'image' | 'video' | 'color' | 'gradient';
  backgroundUrl?: string;
  backgroundColor?: string;
  transition?: 'fade' | 'slide' | 'zoom' | 'flip';
  elements: ScreenElement[];
}

export type TemplateFieldType = 
  | 'text'
  | 'longtext'
  | 'date'
  | 'time'
  | 'image'
  | 'gallery'
  | 'list'
  | 'colors';

export interface TemplateField {
  key: string;
  label: string;
  type: TemplateFieldType;
  defaultValue?: any;
  required?: boolean;
  editable?: boolean;
  maxLength?: number;
  helpText?: string;
}

export interface InvitationTemplate {
  id: string;
  productId?: string;           // links to Product
  name: string;
  description?: string;
  mode: 'page' | 'scroll';
  pages: TemplatePage[];
  fields: TemplateField[];
  fontOptions: string[];
  defaultFont?: string;
  introVideoUrl?: string;
  musicUrl?: string;
  thumbnailUrl?: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt?: string;
}

export interface RsvpConfig {
  enabled?: boolean;
  emailRequired?: boolean;
  deadlineText?: string;
  customQuestions?: string[];   // up to 3 questions
}

export interface InvitationVersion {
  timestamp: string;
  data: Record<string, any>;
  note?: string;
  updatedBy?: string;
}

export interface Invitation {
  id: string;
  slug: string;                 // unique URL: mitinvitations.com/i/:slug
  templateId: string;
  ownerUid: string;
  ownerEmail: string;
  data: Record<string, any>;
  fontChoice?: string;
  countdownEnabled?: boolean;
  countdownDate?: string;
  countdownFormat?: 'days' | 'full';
  eventPassedMessage?: string;
  rsvpEnabled?: boolean;
  rsvpConfig?: RsvpConfig;
  status: 'draft' | 'pending_payment' | 'paid' | 'live' | 'disabled';
  paymentApproved: boolean;
  paymentMethod?: 'jazzcash' | 'easypaisa' | 'bank' | 'other' | string;
  paymentMethodChosen?: string; // chosen by client during checkout/pending payment
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  versions?: InvitationVersion[];
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  attending: 'yes' | 'no' | 'maybe';
  guestCount: number;
  message?: string;
  customAnswers?: Record<string, string>;
  editToken: string;            // secret token allowing guest to edit their own response
  source: 'link' | 'manual';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt?: string;
}

export interface ClientProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface AdminLogItem {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetId: string;
  details?: Record<string, any>;
}

export interface ManualPaymentSettings {
  jazzcashNumber?: string;
  jazzcashTitle?: string;
  easypaisaNumber?: string;
  easypaisaTitle?: string;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  paymentInstructions?: string;
}
