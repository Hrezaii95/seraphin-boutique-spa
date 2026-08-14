import { useCallback, useEffect, useRef, useState } from "react"

type AudioState = {
  context: AudioContext
  gain: GainNode
  sources: AudioScheduledSourceNode[]
}

export function useAmbientSound() {
  const audioRef = useRef<AudioState | null>(null)
  const [enabled, setEnabled] = useState(false)

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.gain.gain.cancelScheduledValues(audio.context.currentTime)
    audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.08)
    window.setTimeout(() => {
      audio.sources.forEach((source) => {
        try { source.stop() } catch { /* already stopped */ }
      })
      void audio.context.close()
    }, 240)
    audioRef.current = null
    setEnabled(false)
  }, [])

  const start = useCallback(() => {
    if (audioRef.current) return
    const AudioContextClass = window.AudioContext
    if (!AudioContextClass) return

    const context = new AudioContextClass()
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, context.currentTime)
    gain.gain.linearRampToValueAtTime(0.055, context.currentTime + 1.8)
    gain.connect(context.destination)

    const filter = context.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 420
    filter.Q.value = 0.7
    filter.connect(gain)

    const fundamental = context.createOscillator()
    fundamental.type = "sine"
    fundamental.frequency.value = 55
    const overtone = context.createOscillator()
    overtone.type = "sine"
    overtone.frequency.value = 110
    const overtoneGain = context.createGain()
    overtoneGain.gain.value = 0.18
    overtone.connect(overtoneGain).connect(filter)
    fundamental.connect(filter)

    const lfo = context.createOscillator()
    const lfoGain = context.createGain()
    lfo.frequency.value = 0.065
    lfoGain.gain.value = 0.018
    lfo.connect(lfoGain).connect(gain.gain)

    fundamental.start()
    overtone.start()
    lfo.start()
    audioRef.current = { context, gain, sources: [fundamental, overtone, lfo] }
    setEnabled(true)
  }, [])

  const toggle = useCallback(() => {
    if (audioRef.current) stop()
    else start()
  }, [start, stop])

  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) void audio.context.suspend()
      else void audio.context.resume()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      stop()
    }
  }, [stop])

  return { enabled, toggle }
}
