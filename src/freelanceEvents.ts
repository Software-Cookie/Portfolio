// Any button on the page can open the freelance form popup by calling openFreelance().
// The popup also opens when someone lands on the site with #freelance in the URL.
const EVENT = 'freelance:open'

export const openFreelance = () => window.dispatchEvent(new Event(EVENT))

export function onFreelanceOpen(fn: () => void) {
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}
