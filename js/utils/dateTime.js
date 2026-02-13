window.Alcove = window.Alcove || {};

Alcove.dateTime = {
  getGreeting(name) {
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour < 5)       timeGreeting = 'Happy late night reading';
    else if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else if (hour < 21) timeGreeting = 'Good evening';
    else                timeGreeting = 'Happy late night reading';

    return `${timeGreeting}, ${name}`;
  },

  getSubGreeting() {
    const messages = [
      'Welcome back to your reading nook.',
      'Your books have been waiting for you.',
      'Ready for another chapter?',
      'Time to curl up with a good book.',
      'What will you read today?',
      'Let\'s find your next great read.',
      'Your cozy corner awaits.',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  timeAgo(isoString) {
    if (!isoString) return '';
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return Alcove.dateTime.formatDate(isoString);
  }
};
