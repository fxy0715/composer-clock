/** Client half of the composer-clock bundle.
 * Registers a slim local-time/date strip into the `conversation.composer.dock` slot.
 * Styles use only `--dsw-alias-*` theme tokens so light/dark themes both work.
 */
window.__ModuleLoader__.load({
  id: '@local/composer-clock',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'composerClock';
    const DICTS = {
      en: { title: 'Local time', timezone: 'Timezone' },
      zh: { title: '本地时间', timezone: '时区' },
    };

    function pad2(value) {
      return value < 10 ? '0' + value : String(value);
    }

    function localeTag(ctx) {
      try {
        const snap = ctx.locale.getLocale();
        if (typeof snap === 'string') return snap;
        if (snap && typeof snap.locale === 'string') return snap.locale;
        if (snap && typeof snap.id === 'string') return snap.id;
      } catch (error) {
        // Fall through to the default tag.
      }
      return 'en';
    }

    function timeZoneName() {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      } catch (error) {
        return '';
      }
    }

    function formatDate(date, tag) {
      try {
        return date.toLocaleDateString(tag, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        });
      } catch (error) {
        return date.toLocaleDateString();
      }
    }

    return {
      inject: ['slots', 'locale', 'timer'],
      apply(ctx) {
        const cleanups = [];
        const own = (dispose) => {
          if (typeof dispose === 'function') cleanups.push(dispose);
        };

        // A locale failure must never keep the slot entry from registering.
        for (const id of Object.keys(DICTS)) {
          try {
            own(ctx.locale.register(NS, id, DICTS[id]));
          } catch (error) {
            // The panel falls back to the bundled dictionaries below.
          }
        }

        function translate(tag, key) {
          try {
            const t = ctx.locale.bind(NS);
            const text = t(key);
            if (typeof text === 'string' && text) return text;
          } catch (error) {
            // Fall through to the bundled dictionaries.
          }
          const dict = DICTS[tag] || DICTS.en;
          return dict[key];
        }

        function subscribeLocale(callback) {
          try {
            return ctx.locale.subscribe(callback);
          } catch (error) {
            return () => {};
          }
        }

        function ClockPanel() {
          const [now, setNow] = React.useState(() => new Date());
          const [, setLocaleTick] = React.useState(0);

          React.useEffect(() => {
            const stopTimer = ctx.timer.interval(() => setNow(new Date()), 1000);
            const unsubscribe = subscribeLocale(() => setLocaleTick((n) => n + 1));
            return () => {
              unsubscribe();
              stopTimer();
            };
          }, []);

          const tag = localeTag(ctx);
          const title = translate(tag, 'title');
          const time =
            pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
          const zone = timeZoneName();

          const rowStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            boxSizing: 'border-box',
            padding: '4px 2px',
            fontSize: 12,
            lineHeight: 1.4,
            color: 'var(--dsw-alias-label-secondary)',
            userSelect: 'none',
          };
          const timeStyle = {
            color: 'var(--dsw-alias-label-primary)',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          };
          const dotStyle = {
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--dsw-alias-brand-primary)',
            flex: 'none',
          };
          const zoneStyle = {
            marginLeft: 'auto',
            color: 'var(--dsw-alias-state-idle-primary)',
          };

          return h(
            'div',
            {
              style: rowStyle,
              role: 'group',
              'aria-label': title,
              title: title,
            },
            h('span', { style: dotStyle, 'aria-hidden': true }),
            h('span', { style: timeStyle }, time),
            h('span', { 'aria-hidden': true }, '·'),
            h('span', null, formatDate(now, tag)),
            zone ? h('span', { style: zoneStyle, title: translate(tag, 'timezone') }, zone) : null,
          );
        }

        own(
          ctx.slots.inject('conversation.composer.dock', () =>
            ctx.slots.register(
              {
                name: 'conversation.composer.dock',
                id: 'composer-clock',
                order: 5,
                label: () => {
                  try {
                    return translate(localeTag(ctx), 'title');
                  } catch (error) {
                    return 'Local time';
                  }
                },
              },
              ClockPanel,
            ),
          ),
        );

        let disposed = false;
        return () => {
          if (disposed) return;
          disposed = true;
          for (const dispose of cleanups) {
            try {
              dispose();
            } catch (error) {
              // Keep disposing the remaining resources.
            }
          }
        };
      },
    };
  },
});
