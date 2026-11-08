/* Homepage slider — slide between lineup 1 and lineup 2.
   Supports arrow buttons, touch swipe, mouse drag and keyboard arrows.
   Progressive enhancement: without JS the arrows are normal links. */
(function () {
  var slider = document.getElementById('homeSlider');
  if (!slider) return;

  var track = slider.querySelector('.slider__track');
  var slides = slider.querySelectorAll('.slide');
  var count = slides.length;
  var index = 0;

  function clamp(i) {
    return Math.max(0, Math.min(count - 1, i));
  }

  function render(animate) {
    track.style.transition = animate ? '' : 'none';
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
  }

  function go(i) {
    index = clamp(i);
    render(true);
    try {
      history.replaceState(
        null,
        '',
        index === 0 ? location.pathname + location.search : '#lineup-2'
      );
    } catch (e) {}
  }

  // Start on the slide indicated by the URL hash (e.g. returning via #lineup-2).
  if (location.hash === '#lineup-2') index = clamp(1);
  render(false);

  // Arrow buttons.
  slider.querySelectorAll('[data-slide-next]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      go(index + 1);
    });
  });
  slider.querySelectorAll('[data-slide-prev]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      go(index - 1);
    });
  });

  // Keyboard.
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
  });

  // Touch swipe / mouse drag.
  var startX = 0, startY = 0, dragging = false, moved = false, horizontal = false;

  slider.addEventListener('pointerdown', function (e) {
    dragging = true;
    moved = false;
    horizontal = false;
    startX = e.clientX;
    startY = e.clientY;
    track.style.transition = 'none';
  });

  slider.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    // Decide this is a horizontal gesture only once movement is clearly sideways.
    if (!horizontal && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      horizontal = true;
      try { slider.setPointerCapture(e.pointerId); } catch (err) {}
    }
    if (horizontal) {
      moved = true;
      var pct = -index * 100 + (dx / slider.offsetWidth) * 100;
      track.style.transform = 'translateX(' + pct + '%)';
    }
  });

  function finish(e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    var dx = (typeof e.clientX === 'number' ? e.clientX : startX) - startX;
    var threshold = slider.offsetWidth * 0.15;
    if (horizontal && dx <= -threshold) go(index + 1);
    else if (horizontal && dx >= threshold) go(index - 1);
    else render(true); // not far enough — snap back
  }

  slider.addEventListener('pointerup', finish);
  slider.addEventListener('pointercancel', finish);

  // If the gesture was a swipe, cancel the hotspot link that would otherwise fire.
  slider.addEventListener(
    'click',
    function (e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true
  );
})();
