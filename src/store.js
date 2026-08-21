import { shallowRef, onBeforeUnmount } from 'vue'
import { createStore } from 'zustand/vanilla'

export const appStore = createStore((set) => ({
  pointer: { x: 0.5, y: 0.5 },
  scroll: 0,
  webgpu: false,
  menuOpen: false,
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setScroll: (scroll) => set({ scroll }),
  setWebgpu: (webgpu) => set({ webgpu }),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
}))

export function useAppStore(selector = (state) => state) {
  const selected = shallowRef(selector(appStore.getState()))
  const unsubscribe = appStore.subscribe((state) => {
    selected.value = selector(state)
  })
  onBeforeUnmount(unsubscribe)
  return selected
}
