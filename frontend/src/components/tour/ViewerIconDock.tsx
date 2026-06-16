'use client';

import React from 'react';
import { GlassIconButton } from '../GlassIconButton';
import { Play, Images, Volume2, VolumeX, List, Palette } from '../../assets/icons';

export interface ViewerIconDockProps {
  hasVideo: boolean;
  hasGallery: boolean;
  hasMultipleVariants: boolean;
  hasMultipleRooms: boolean;
  isMuted: boolean;
  onPlayVideo: () => void;
  onOpenGallery: () => void;
  onToggleStyle: () => void;
  onPrevRoom: () => void;
  onNextRoom: () => void;
  onOpenRoomsMenu: () => void;
  onToggleMute: () => void;
}

/**
 * Right-rail icon dock for the 360 tour screen.
 *
 * Each control is a shared {@link GlassIconButton} with a left-anchored
 * tooltip. Room prev/next navigation lives in the bottom RoomNavigator, so the
 * dock focuses on media, gallery, style, rooms menu, and audio.
 */
export const ViewerIconDock: React.FC<ViewerIconDockProps> = ({
  hasVideo: _hasVideo,
  hasGallery: _hasGallery,
  hasMultipleVariants: _hasMultipleVariants,
  hasMultipleRooms: _hasMultipleRooms,
  isMuted,
  onPlayVideo,
  onOpenGallery,
  onToggleStyle,
  onPrevRoom: _onPrevRoom,
  onNextRoom: _onNextRoom,
  onOpenRoomsMenu,
  onToggleMute,
}) => {
  return (
    <div className="pointer-events-auto absolute right-element md:right-group top-1/2 -translate-y-1/2 flex flex-col items-center gap-tight z-20">
      <GlassIconButton label="Play room walkthrough" tooltip tooltipPosition="left" onClick={onPlayVideo}>
        <Play size={20} />
      </GlassIconButton>

      <GlassIconButton label="Open image gallery" tooltip tooltipPosition="left" onClick={onOpenGallery}>
        <Images size={20} />
      </GlassIconButton>

      <GlassIconButton label="Change design style" tooltip tooltipPosition="left" onClick={onToggleStyle}>
        <Palette size={20} />
      </GlassIconButton>

      <GlassIconButton label="Open rooms menu" tooltip tooltipPosition="left" onClick={onOpenRoomsMenu}>
        <List size={20} />
      </GlassIconButton>

      <GlassIconButton
        label={isMuted ? 'Unmute audio' : 'Mute audio'}
        tooltip
        tooltipPosition="left"
        active={!isMuted}
        onClick={onToggleMute}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </GlassIconButton>
    </div>
  );
};
