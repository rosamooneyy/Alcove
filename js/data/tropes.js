window.Alcove = window.Alcove || {};

// Comprehensive list of book tropes organized by category
Alcove.TROPES = {
  romance: {
    label: 'Romance',
    color: '#C4919B', // dusty rose
    tropes: [
      { id: 'enemies-to-lovers', label: 'Enemies to Lovers' },
      { id: 'slow-burn', label: 'Slow Burn' },
      { id: 'second-chance', label: 'Second Chance Romance' },
      { id: 'forced-proximity', label: 'Forced Proximity' },
      { id: 'fake-dating', label: 'Fake Dating' },
      { id: 'grumpy-sunshine', label: 'Grumpy/Sunshine' },
      { id: 'friends-to-lovers', label: 'Friends to Lovers' },
      { id: 'forbidden-love', label: 'Forbidden Love' },
      { id: 'age-gap', label: 'Age Gap' },
      { id: 'instalove', label: 'Instalove' },
      { id: 'love-triangle', label: 'Love Triangle' },
      { id: 'soulmates', label: 'Soulmates/Fated Mates' },
      { id: 'marriage-of-convenience', label: 'Marriage of Convenience' },
      { id: 'only-one-bed', label: 'Only One Bed' },
      { id: 'he-falls-first', label: 'He Falls First' },
      { id: 'she-falls-first', label: 'She Falls First' },
      { id: 'opposites-attract', label: 'Opposites Attract' },
      { id: 'bodyguard-romance', label: 'Bodyguard Romance' },
      { id: 'billionaire', label: 'Billionaire Romance' },
      { id: 'small-town-romance', label: 'Small Town Romance' },
    ]
  },
  fantasy: {
    label: 'Fantasy & Sci-Fi',
    color: '#7A8B6F', // sage
    tropes: [
      { id: 'chosen-one', label: 'Chosen One' },
      { id: 'magic-school', label: 'Magic School/Academy' },
      { id: 'found-family', label: 'Found Family' },
      { id: 'morally-gray', label: 'Morally Gray Characters' },
      { id: 'prophecy', label: 'Prophecy' },
      { id: 'portal-fantasy', label: 'Portal Fantasy' },
      { id: 'hidden-royalty', label: 'Hidden Royalty' },
      { id: 'dragon-riders', label: 'Dragon Riders' },
      { id: 'fae', label: 'Fae/Faerie' },
      { id: 'vampires', label: 'Vampires' },
      { id: 'werewolves', label: 'Werewolves/Shifters' },
      { id: 'witches', label: 'Witches/Wizards' },
      { id: 'dark-academia', label: 'Dark Academia' },
      { id: 'quest', label: 'Epic Quest' },
      { id: 'heist', label: 'Heist' },
      { id: 'space-opera', label: 'Space Opera' },
      { id: 'dystopian', label: 'Dystopian' },
      { id: 'post-apocalyptic', label: 'Post-Apocalyptic' },
      { id: 'time-travel', label: 'Time Travel' },
      { id: 'ai-robots', label: 'AI/Robots' },
    ]
  },
  mystery: {
    label: 'Mystery & Thriller',
    color: '#5B7A9B', // sky blue
    tropes: [
      { id: 'locked-room', label: 'Locked Room Mystery' },
      { id: 'unreliable-narrator', label: 'Unreliable Narrator' },
      { id: 'cozy-mystery', label: 'Cozy Mystery' },
      { id: 'police-procedural', label: 'Police Procedural' },
      { id: 'amateur-sleuth', label: 'Amateur Sleuth' },
      { id: 'whodunit', label: 'Whodunit' },
      { id: 'cold-case', label: 'Cold Case' },
      { id: 'serial-killer', label: 'Serial Killer' },
      { id: 'psychological-thriller', label: 'Psychological Thriller' },
      { id: 'domestic-thriller', label: 'Domestic Thriller' },
      { id: 'courtroom-drama', label: 'Courtroom Drama' },
      { id: 'conspiracy', label: 'Conspiracy' },
      { id: 'espionage', label: 'Espionage/Spy' },
      { id: 'true-crime', label: 'True Crime Style' },
    ]
  },
  characters: {
    label: 'Character Types',
    color: '#C9A84C', // gold
    tropes: [
      { id: 'anti-hero', label: 'Anti-Hero' },
      { id: 'villain-protagonist', label: 'Villain Protagonist' },
      { id: 'reluctant-hero', label: 'Reluctant Hero' },
      { id: 'strong-female-lead', label: 'Strong Female Lead' },
      { id: 'ensemble-cast', label: 'Ensemble Cast' },
      { id: 'lovable-rogue', label: 'Lovable Rogue' },
      { id: 'mentor-figure', label: 'Mentor Figure' },
      { id: 'sibling-bond', label: 'Sibling Bond' },
      { id: 'best-friend-squad', label: 'Best Friend Squad' },
      { id: 'rivals', label: 'Rivals' },
    ]
  },
  themes: {
    label: 'Themes & Plots',
    color: '#8B6F4E', // mocha
    tropes: [
      { id: 'coming-of-age', label: 'Coming of Age' },
      { id: 'revenge', label: 'Revenge' },
      { id: 'redemption', label: 'Redemption Arc' },
      { id: 'survival', label: 'Survival' },
      { id: 'identity', label: 'Identity/Self-Discovery' },
      { id: 'trauma-recovery', label: 'Trauma Recovery' },
      { id: 'grief', label: 'Grief/Loss' },
      { id: 'family-secrets', label: 'Family Secrets' },
      { id: 'inheritance', label: 'Inheritance Mystery' },
      { id: 'underdog', label: 'Underdog Story' },
      { id: 'rags-to-riches', label: 'Rags to Riches' },
      { id: 'fish-out-of-water', label: 'Fish Out of Water' },
      { id: 'road-trip', label: 'Road Trip' },
      { id: 'summer-romance', label: 'Summer Romance' },
      { id: 'holiday', label: 'Holiday Theme' },
    ]
  },
  representation: {
    label: 'Representation',
    color: '#9B7AB8', // purple
    tropes: [
      { id: 'lgbtq', label: 'LGBTQ+' },
      { id: 'mlm', label: 'M/M Romance' },
      { id: 'wlw', label: 'F/F Romance' },
      { id: 'bisexual-rep', label: 'Bisexual Rep' },
      { id: 'trans-rep', label: 'Trans Rep' },
      { id: 'nonbinary-rep', label: 'Nonbinary Rep' },
      { id: 'disability-rep', label: 'Disability Rep' },
      { id: 'neurodivergent', label: 'Neurodivergent Rep' },
      { id: 'mental-health', label: 'Mental Health Rep' },
      { id: 'own-voices', label: 'Own Voices' },
      { id: 'diverse-cast', label: 'Diverse Cast' },
    ]
  },
  mood: {
    label: 'Mood & Style',
    color: '#6B8B8B', // teal
    tropes: [
      { id: 'dark', label: 'Dark/Gritty' },
      { id: 'lighthearted', label: 'Lighthearted' },
      { id: 'emotional', label: 'Emotional/Tearjerker' },
      { id: 'humorous', label: 'Humorous' },
      { id: 'romantic', label: 'Romantic' },
      { id: 'action-packed', label: 'Action-Packed' },
      { id: 'atmospheric', label: 'Atmospheric' },
      { id: 'thought-provoking', label: 'Thought-Provoking' },
      { id: 'feel-good', label: 'Feel-Good' },
      { id: 'bittersweet', label: 'Bittersweet' },
      { id: 'spicy', label: 'Spicy/Steamy' },
      { id: 'clean', label: 'Clean/No Spice' },
      { id: 'dual-pov', label: 'Dual POV' },
      { id: 'multi-pov', label: 'Multiple POV' },
      { id: 'first-person', label: 'First Person' },
    ]
  }
};

// Helper to get all tropes as flat array
Alcove.getAllTropes = function() {
  const all = [];
  for (const [categoryId, category] of Object.entries(Alcove.TROPES)) {
    for (const trope of category.tropes) {
      all.push({
        ...trope,
        categoryId,
        categoryLabel: category.label,
        categoryColor: category.color
      });
    }
  }
  return all;
};

// Helper to find a trope by ID
Alcove.getTropeById = function(tropeId) {
  for (const [categoryId, category] of Object.entries(Alcove.TROPES)) {
    const trope = category.tropes.find(t => t.id === tropeId);
    if (trope) {
      return {
        ...trope,
        categoryId,
        categoryLabel: category.label,
        categoryColor: category.color
      };
    }
  }
  return null;
};

// Helper to search tropes by label
Alcove.searchTropes = function(query) {
  const q = query.toLowerCase();
  return Alcove.getAllTropes().filter(t =>
    t.label.toLowerCase().includes(q) || t.id.includes(q)
  );
};
