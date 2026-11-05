'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pause, Play } from 'lucide-react'
import { isHeroMotionEnabled } from '@/lib/hero-motion-settings'
import type { HeroMotionController } from '@/lib/hero-motion'
import './HeroMotionPreview.css'

/** Approved homepage motion, with a static fallback and explicit pause control. */
export function HeroMotionPreview() {
  const marker = useRef<HTMLSpanElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const controller = useRef<HeroMotionController | null>(null)
  const playing = useRef(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [load, setLoad] = useState(false)
  const [paused, setPaused] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle')

  useEffect(() => {
    if (!isHeroMotionEnabled(window.location.search)) return
    const figure = marker.current?.closest('figure')
    const section = marker.current?.closest('section')
    if (!figure || !section) return
    figure.setAttribute('data-motion-preview', 'true')
    setHost(section); setEnabled(true)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    playing.current = !media.matches
    setPaused(media.matches); setLoad(!media.matches)
    const preferenceChanged = () => {
      // A changed OS preference stops decorative motion. No automatic restart.
      if (media.matches) {
        playing.current = false; setPaused(true); setLoad(false); setState('idle')
      }
    }
    media.addEventListener('change', preferenceChanged)
    return () => { media.removeEventListener('change', preferenceChanged); figure.removeAttribute('data-motion-preview') }
  }, [])

  useEffect(() => {
    if (!enabled || !load || !canvas.current) return
    const abort = new AbortController()
    const target = canvas.current
    setState('loading')
    const failure = (error?: unknown) => {
      if (!abort.signal.aborted) {
        console.warn('Hero motion falls back to its original image:', error)
        setState('unavailable')
      }
    }
    import('@/lib/hero-motion').then(module => module.startHeroMotion(target, abort.signal, failure))
      .then(instance => {
        if (abort.signal.aborted) { instance?.destroy(); return }
        if (!instance) return
        controller.current = instance
        instance.setPlaying(playing.current)
        setState('ready')
      }).catch(failure)
    return () => { abort.abort(); controller.current?.destroy(); controller.current = null }
  }, [enabled, load])

  function toggle() {
    const nextPlaying = !playing.current
    playing.current = nextPlaying; setPaused(!nextPlaying)
    if (nextPlaying) setLoad(true)
    controller.current?.setPlaying(nextPlaying)
  }

  return <>
    <span ref={marker} hidden />
    {enabled && load && <canvas ref={canvas} className="hero-motion-canvas" aria-hidden="true"
      data-ready={state === 'ready' ? 'true' : 'false'} />}
    {enabled && host && createPortal(<div className="hero-motion-controls" data-motion-state={state}>
      <span>江湖微動</span>
      {state === 'unavailable' ? <span role="status">此裝置顯示原圖</span> :
        <button type="button" onClick={toggle} aria-pressed={!paused}
          aria-label="背景動態" title={paused ? '播放背景動態' : '暫停背景動態'}>
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          {paused ? '播放動態' : '暫停動態'}
        </button>}
    </div>, host)}
  </>
}
