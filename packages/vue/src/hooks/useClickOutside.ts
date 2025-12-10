/**
 * useClickOutside Hook
 * 点击外部区域检测
 */

import { onMounted, onUnmounted, type Ref } from 'vue';

export function useClickOutside(
  elementRefs: Ref<HTMLElement | null>[],
  callback: (event: MouseEvent) => void
): void {
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const isOutside = elementRefs.every((ref) => {
      const el = ref.value;
      return el && !el.contains(target);
    });

    if (isOutside) {
      callback(event);
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClick, true);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClick, true);
  });
}
