import { Router } from '@angular/router';

/** The « À propos » section of the landing page, which the header links to. */
export const ABOUT_ANCHOR = 'a-propos';

/**
 * Follows the header's « À propos » link. On the landing page already, it glides down
 * like the hero's buttons; from a tool, the router brings the page and scrolls to it.
 */
export function goToAbout(event: MouseEvent, router: Router): void {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return; // A new tab or window: the browser follows the href.
  event.preventDefault();
  const section = router.url.split(/[?#]/)[0] === '/' && document.getElementById(ABOUT_ANCHOR);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else void router.navigate(['/'], { fragment: ABOUT_ANCHOR });
}
