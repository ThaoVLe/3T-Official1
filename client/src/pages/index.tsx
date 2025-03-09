// Restore scroll position if returning from entry view or settings
  React.useEffect(() => {
    const scrollPosition = sessionStorage.getItem('homeScrollPosition');
    const lastViewedEntryId = sessionStorage.getItem('lastViewedEntryId');
    const shouldRestoreScroll = sessionStorage.getItem('shouldRestoreScroll');

    if ((scrollPosition && entryCardsRef.current) || shouldRestoreScroll) {
      setTimeout(() => {
        if (entryCardsRef.current && scrollPosition) {
          entryCardsRef.current.scrollTop = parseInt(scrollPosition, 10);
        }

        // Clear after using
        sessionStorage.removeItem('homeScrollPosition');
        sessionStorage.removeItem('shouldRestoreScroll');

        // If we have a last viewed entry, scroll to it
        if (lastViewedEntryId && entries.length > 0) {
          const entryIndex = entries.findIndex(e => e.id.toString() === lastViewedEntryId);
          if (entryIndex >= 0) {
            // Focus the entry visually (optional)
            setFocusedEntryId(parseInt(lastViewedEntryId, 10));

            // Clear after 2 seconds
            setTimeout(() => {
              setFocusedEntryId(undefined);
              sessionStorage.removeItem('lastViewedEntryId');
            }, 2000);
          }
        }
      }, 100);
    }
  }, []);