// State management
const state = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  query: '',
  selectedLanguages: [],
  minIssues: 0,
  sort: 'stars',
  page: 1,
  perPage: 9,
  totalCount: 0,
  isLoading: false,
  hasMore: false,
  lastRequestTime: 0,
  languages: []
};

// DOM Elements
const elements = {
  themeToggle: document.getElementById('themeToggle'),
  filterBtn: document.getElementById('filterBtn'),
  filterPanel: document.getElementById('filterPanel'),
  closeFilterBtn: document.getElementById('closeFilterBtn'),
  issuesSlider: document.getElementById('issuesSlider'),
  issuesValue: document.getElementById('issuesValue'),
  applyFilters: document.getElementById('applyFilters'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  resultsContainer: document.getElementById('resultsContainer'),
  resultsCount: document.getElementById('resultsCount'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  errorContainer: document.getElementById('errorContainer'),
  errorMessage: document.getElementById('errorMessage'),
  loadMoreContainer: document.getElementById('loadMoreContainer'),
  loadMoreButton: document.getElementById('loadMoreButton'),
  emptyState: document.getElementById('emptyState'),
  body: document.body,
  languageInput: document.getElementById('languageInput'),
  languageDropdown: document.getElementById('languageDropdown'),
  selectedLanguages: document.getElementById('selectedLanguages'),
  clearLanguage: document.getElementById('clearLanguage')
};

// Initialize the app
function init() {
  applyTheme();
  setupEventListeners();
  setupLanguageSearch();
  updateSliderValue();
  checkForCachedResults();
}

// Apply current theme
function applyTheme() {
  if (state.darkMode) {
    elements.body.setAttribute('data-theme', 'dark');
    document.querySelector('.fa-moon').style.display = 'none';
    document.querySelector('.fa-sun').style.display = 'block';
  } else {
    elements.body.setAttribute('data-theme', 'light');
    document.querySelector('.fa-moon').style.display = 'block';
    document.querySelector('.fa-sun').style.display = 'none';
  }
}

// Toggle theme
function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('darkMode', state.darkMode);
  applyTheme();
}

// Set up event listeners
function setupEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Filter panel
  elements.filterBtn.addEventListener('click', () => {
    elements.filterPanel.classList.add('active');
    elements.filterBtn.setAttribute('aria-expanded', 'true');
  });
  
  elements.closeFilterBtn.addEventListener('click', () => {
    elements.filterPanel.classList.remove('active');
    elements.filterBtn.setAttribute('aria-expanded', 'false');
  });
  
  // Issues slider
  elements.issuesSlider.addEventListener('input', updateSliderValue);
  
  // Apply filters
  elements.applyFilters.addEventListener('click', applyFilters);
  
  // Search
  elements.searchButton.addEventListener('click', handleSearch);
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Debounced search input
  let debounceTimer;
  elements.searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (elements.searchInput.value.trim() !== '') {
        handleSearch();
      }
    }, 500);
  });
  
  // Load more
  elements.loadMoreButton.addEventListener('click', loadMoreResults);
  
  // Infinite scroll
  window.addEventListener('scroll', handleScroll);
}

// Language search implementation
function setupLanguageSearch() {
  // Define languages with aliases
  state.languages = [
    { name: "JavaScript", aliases: ["js", "javascript", "ecmascript"] },
    { name: "Python", aliases: ["py", "python"] },
    { name: "Java", aliases: ["java", "jav"] },
    { name: "TypeScript", aliases: ["ts", "typescript"] },
    { name: "C++", aliases: ["cpp", "c++", "cplusplus"] },
    { name: "C#", aliases: ["csharp", "c#", "cs"] },
    { name: "PHP", aliases: ["php"] },
    { name: "Ruby", aliases: ["rb", "ruby"] },
    { name: "Go", aliases: ["go", "golang"] },
    { name: "Swift", aliases: ["swift"] },
    { name: "Kotlin", aliases: ["kt", "kotlin"] },
    { name: "Rust", aliases: ["rs", "rust"] },
    { name: "Scala", aliases: ["scala"] },
    { name: "Dart", aliases: ["dart"] },
    { name: "Elixir", aliases: ["ex", "elixir"] },
    { name: "R", aliases: ["r"] },
    { name: "MATLAB", aliases: ["matlab"] },
    { name: "Perl", aliases: ["pl", "perl"] },
    { name: "Lua", aliases: ["lua"] },
    { name: "Haskell", aliases: ["hs", "haskell"] },
    { name: "SQL", aliases: ["sql", "sequel"] },
    { name: "Objective-C", aliases: ["objc", "objectivec", "obj-c"] },
    { name: "Groovy", aliases: ["groovy", "gvy"] },
    { name: "Julia", aliases: ["jl", "julia"] },
    { name: "Clojure", aliases: ["clj", "clojure"] },
    { name: "Erlang", aliases: ["erl", "erlang"] },
    { name: "F#", aliases: ["fsharp", "f#"] },
    { name: "OCaml", aliases: ["ml", "ocaml"] },
    { name: "Scheme", aliases: ["scm", "scheme"] },
    { name: "Prolog", aliases: ["prolog", "pl"] },
    { name: "Solidity", aliases: ["solidity", "sol"] },
    { name: "VHDL", aliases: ["vhdl"] },
    { name: "Verilog", aliases: ["verilog", "v"] },
    { name: "Assembly", aliases: ["asm", "assembly"] },
    { name: "COBOL", aliases: ["cobol"] },
    { name: "Fortran", aliases: ["fortran", "f90"] },
    { name: "Lisp", aliases: ["lisp"] },
    { name: "Delphi", aliases: ["delphi", "pascal"] },
    { name: "PowerShell", aliases: ["ps", "powershell"] },
    { name: "Bash", aliases: ["bash", "sh", "shell"] },
    { name: "C", aliases: ["c"] },
    { name: "CoffeeScript", aliases: ["coffee", "coffeescript"] },
    { name: "D", aliases: ["d"] },
    { name: "Elm", aliases: ["elm"] },
    { name: "Forth", aliases: ["forth"] },
    { name: "Haxe", aliases: ["haxe", "hx"] },
    { name: "Jupyter Notebook", aliases: ["ipynb", "jupyter"] },
    { name: "LabVIEW", aliases: ["lv", "labview"] },
    { name: "Markdown", aliases: ["md", "markdown"] },
    { name: "Nim", aliases: ["nim", "nimrod"] },
    { name: "Octave", aliases: ["octave"] },
    { name: "PL/SQL", aliases: ["plsql", "pl/sql"] },
    { name: "PostScript", aliases: ["ps", "postscript"] },
    { name: "Puppet", aliases: ["puppet", "pp"] },
    { name: "Q#", aliases: ["qsharp", "q#"] },
    { name: "Racket", aliases: ["rkt", "racket"] },
    { name: "Reason", aliases: ["re", "reason"] },
    { name: "Rexx", aliases: ["rexx"] },
    { name: "Ring", aliases: ["ring"] },
    { name: "SAS", aliases: ["sas"] },
    { name: "Smalltalk", aliases: ["st", "smalltalk"] },
    { name: "Stata", aliases: ["stata", "do"] },
    { name: "Tcl", aliases: ["tcl", "tickle"] },
    { name: "TeX", aliases: ["tex", "latex"] },
    { name: "Twig", aliases: ["twig"] },
    { name: "VBScript", aliases: ["vbs", "vbscript"] },
    { name: "Visual Basic", aliases: ["vb", "visualbasic"] },
    { name: "WebAssembly", aliases: ["wasm", "webassembly"] },
    { name: "XSLT", aliases: ["xslt"] },
    { name: "YAML", aliases: ["yaml", "yml"] },
    { name: "Zig", aliases: ["zig"] },
    { name: "ABAP", aliases: ["abap"] },
    { name: "ActionScript", aliases: ["as", "actionscript"] },
    { name: "Ada", aliases: ["ada"] },
    { name: "Apex", aliases: ["apex"] },
    { name: "Arduino", aliases: ["ino", "arduino"] },
    { name: "AutoHotkey", aliases: ["ahk", "autohotkey"] },
    { name: "AutoIt", aliases: ["au3", "autoit"] },
    { name: "BlitzMax", aliases: ["bmx", "blitzmax"] },
    { name: "Boo", aliases: ["boo"] },
    { name: "Ceylon", aliases: ["ceylon"] },
    { name: "Chapel", aliases: ["chpl", "chapel"] },
    { name: "Clean", aliases: ["clean", "icl"] },
    { name: "ClojureScript", aliases: ["cljs", "clojurescript"] },
    { name: "Crystal", aliases: ["cr", "crystal"] },
    { name: "CUDA", aliases: ["cu", "cuda"] },
    { name: "Dart", aliases: ["dart"] },
    { name: "Eiffel", aliases: ["e", "eiffel"] },
    { name: "Elm", aliases: ["elm"] },
    { name: "Emacs Lisp", aliases: ["el", "elisp", "emacs-lisp"] },
    { name: "F*", aliases: ["fstar", "f*"] },
    { name: "Factor", aliases: ["factor"] },
    { name: "Fantom", aliases: ["fan", "fantom"] },
    { name: "FLUX", aliases: ["flux"] },
    { name: "GDScript", aliases: ["gd", "gdscript"] },
    { name: "Genie", aliases: ["gs", "genie"] },
    { name: "Gherkin", aliases: ["feature", "gherkin"] },
    { name: "Golo", aliases: ["golo"] },
    { name: "Gosu", aliases: ["gosu"] },
    { name: "Grace", aliases: ["grace"] },
    { name: "Hack", aliases: ["hh", "hack"] },
    { name: "Harbour", aliases: ["hb", "harbour"] },
    { name: "IDL", aliases: ["idl"] },
    { name: "Io", aliases: ["io"] },
    { name: "J", aliases: ["j"] },
    { name: "Janet", aliases: ["janet", "jnt"] },
    { name: "Jolie", aliases: ["iol", "jolie"] },
    { name: "Joy", aliases: ["joy"] },
    { name: "K", aliases: ["k"] },
    { name: "Kotlin/Native", aliases: ["kn", "kotlin-native"] },
    { name: "LabVIEW G", aliases: ["lvlib", "labview-g"] },
    { name: "LiveScript", aliases: ["ls", "livescript"] },
    { name: "Logtalk", aliases: ["lgt", "logtalk"] },
    { name: "Maple", aliases: ["maple"] },
    { name: "Mercury", aliases: ["m", "mercury"] },
    { name: "Mirah", aliases: ["mirah"] },
    { name: "Modelica", aliases: ["mo", "modelica"] },
    { name: "Modula-3", aliases: ["m3", "modula3"] },
    { name: "Nemerle", aliases: ["n", "nemerle"] },
    { name: "NetLogo", aliases: ["nlogo", "netlogo"] },
    { name: "Nial", aliases: ["nial"] },
    { name: "Nu", aliases: ["nu"] },
    { name: "Oberon", aliases: ["obn", "oberon"] },
    { name: "Object Pascal", aliases: ["oop", "objectpascal"] },
    { name: "Objective-J", aliases: ["j", "objective-j"] },
    { name: "OpenCL", aliases: ["cl", "opencl"] },
    { name: "Oz", aliases: ["oz"] },
    { name: "ParaSail", aliases: ["psl", "parasail"] },
    { name: "Pike", aliases: ["pike"] },
    { name: "Pony", aliases: ["pony"] },
    { name: "Pure Data", aliases: ["pd", "puredata"] },
    { name: "PureScript", aliases: ["purs", "purescript"] },
    { name: "QML", aliases: ["qml"] },
    { name: "Raku", aliases: ["raku", "perl6"] },
    { name: "Red", aliases: ["red", "red/system"] },
    { name: "REBOL", aliases: ["r", "rebol"] },
    { name: "Sather", aliases: ["sa", "sather"] },
    { name: "Self", aliases: ["self"] },
    { name: "Simula", aliases: ["simula"] },
    { name: "Slurm", aliases: ["slurm"] },
    { name: "Snap!", aliases: ["snap"] },
    { name: "SourcePawn", aliases: ["sp", "sourcepawn"] },
    { name: "SPARK", aliases: ["spark"] },
    { name: "Standard ML", aliases: ["sml", "standardml"] },
    { name: "SuperCollider", aliases: ["sc", "supercollider"] },
    { name: "SystemVerilog", aliases: ["sv", "systemverilog"] },
    { name: "TLA+", aliases: ["tla", "tlaplus"] },
    { name: "Unicon", aliases: ["icn", "unicon"] },
    { name: "Vala", aliases: ["vala", "vapi"] },
    { name: "Vim script", aliases: ["vim", "viml"] },
    { name: "Visual FoxPro", aliases: ["vfp", "foxpro"] },
    { name: "Wolfram Language", aliases: ["wl", "wolfram"] },
    { name: "X10", aliases: ["x10"] },
    { name: "XBase++", aliases: ["xb", "xbasepp"] },
    { name: "XQuery", aliases: ["xq", "xquery"] },
    { name: "Xtend", aliases: ["xtend"] },
    { name: "Zsh", aliases: ["zsh"] }
  ];

  // Sort alphabetically
  state.languages.sort((a, b) => a.name.localeCompare(b.name));

  // Event listeners
  elements.languageInput.addEventListener('input', filterLanguages);
  elements.languageInput.addEventListener('focus', () => {
    filterLanguages();
    elements.languageDropdown.classList.add('visible');
  });
  
  elements.languageInput.addEventListener('blur', () => {
    // Only hide dropdown if not clicking on an option
    setTimeout(() => {
      if (!elements.languageDropdown.matches(':hover')) {
        elements.languageDropdown.classList.remove('visible');
      }
    }, 200);
  });

  elements.languageDropdown.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent input blur when clicking dropdown
  });
}

function filterLanguages() {
  const searchTerm = elements.languageInput.value.toLowerCase().trim();
  elements.languageDropdown.innerHTML = '';
  elements.languageDropdown.classList.add('visible');

  if (searchTerm === '') {
    // Show top languages when search is empty
    const topLanguages = state.languages.slice(0, 40);
    topLanguages.forEach(lang => {
      addLanguageOption(lang.name, [], -1);
    });
    return;
  }

  // Filter languages that match
  const matches = [];
  
  state.languages.forEach(lang => {
    // Check name and aliases
    const allTerms = [lang.name.toLowerCase(), ...lang.aliases];
    const foundTerm = allTerms.find(term => term.includes(searchTerm));
    
    if (foundTerm) {
      // Find where the match occurs
      const nameIndex = lang.name.toLowerCase().indexOf(searchTerm);
      matches.push({ lang, nameIndex });
    }
  });

  // Sort by best match (earlier in string is better)
  matches.sort((a, b) => {
    // Prioritize matches at start of word
    if (a.nameIndex === 0 && b.nameIndex !== 0) return -1;
    if (b.nameIndex === 0 && a.nameIndex !== 0) return 1;
    
    // Then by match position
    if (a.nameIndex !== b.nameIndex) return a.nameIndex - b.nameIndex;
    
    // Then alphabetically
    return a.lang.name.localeCompare(b.lang.name);
  });

  // Add to dropdown
  if (matches.length === 0) {
    elements.languageDropdown.innerHTML = '<div class="language-option">No matching languages</div>';
    return;
  }

  matches.slice(0, 20).forEach(({ lang, nameIndex }) => {
    const isSelected = state.selectedLanguages.includes(lang.name);
    addLanguageOption(lang.name, searchTerm, nameIndex, isSelected);
  });
}

function addLanguageOption(name, searchTerm = '', matchIndex = -1, isSelected = false) {
  const option = document.createElement('div');
  option.className = `language-option ${isSelected ? 'selected' : ''}`;
  option.dataset.value = name;
  
  if (searchTerm && matchIndex >= 0) {
    const before = name.substring(0, matchIndex);
    const match = name.substring(matchIndex, matchIndex + searchTerm.length);
    const after = name.substring(matchIndex + searchTerm.length);
    
    option.innerHTML = `
      <span class="name">
        ${before}<span class="match">${match}</span>${after}
      </span>
    `;
  } else {
    option.innerHTML = `<span class="name">${name}</span>`;
  }
  
  if (isSelected) {
    option.innerHTML += '<i class="fas fa-check selected-icon"></i>';
  }
  
  option.addEventListener('click', (e) => {
    e.stopPropagation();
    
    state.selectedLanguages = [name];
    updateLanguageSelectionUI();
    
    elements.languageInput.value = '';
    filterLanguages(); // Keep dropdown open after selection
    elements.languageInput.focus();
  });
  
  elements.languageDropdown.appendChild(option);
}

function addLanguage(langName) {
  if (!state.selectedLanguages.includes(langName)) {
    state.selectedLanguages.push(langName);
    updateLanguageSelectionUI();
  }
}

function removeLanguage(langName) {
  state.selectedLanguages = state.selectedLanguages.filter(lang => lang !== langName);
  updateLanguageSelectionUI();
}

function updateLanguageSelectionUI() {
  const container = document.getElementById('selectedLanguages');
  container.innerHTML = '';
  
  if (state.selectedLanguages.length === 0) {
    // Add placeholder when no languages are selected
    container.innerHTML = '<div class="no-languages">No languages selected</div>';
    return;
  }
  
  state.selectedLanguages.forEach(lang => {
    const tag = document.createElement('div');
    tag.className = 'language-tag';
    tag.innerHTML = `
      <span>${lang}</span>
      <span class="remove" data-lang="${lang}">×</span>
    `;
    container.appendChild(tag);
    
    // Add event listener to remove button
    tag.querySelector('.remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeLanguage(e.target.dataset.lang);
    });
  });
}

function updateSliderValue() {
  elements.issuesValue.textContent = elements.issuesSlider.value;
}

function applyFilters() {
  state.minIssues = parseInt(elements.issuesSlider.value);
  state.sort = document.querySelector('input[name="sort"]:checked').value;
  state.page = 1;
  
  elements.filterPanel.classList.remove('active');
  elements.filterBtn.setAttribute('aria-expanded', 'false');
  
  if (state.query) {
    fetchProjects();
  }
}

function handleSearch() {
  state.query = elements.searchInput.value.trim();
  state.page = 1;
  
  if (state.query) {
    fetchProjects();
  } else {
    showError('Please enter a search term');
  }
}

function showLoading(show) {
  if (show) {
    elements.loadingIndicator.classList.add('visible');
    elements.resultsContainer.style.opacity = '0.5';
  } else {
    elements.loadingIndicator.classList.remove('visible');
    elements.resultsContainer.style.opacity = '1';
  }
}

function showError(message) {
  if (message && message.trim() !== '') {
    elements.errorMessage.textContent = message;
    elements.errorContainer.classList.remove('hidden');
  } else {
    hideError();
  }
}

function hideError() {
  elements.errorContainer.classList.add('hidden');
}

function showEmptyState(show) {
  if (show) {
    elements.emptyState.classList.remove('hidden');
  } else {
    elements.emptyState.classList.add('hidden');
  }
}

function showLoadMoreButton(show) {
  if (show) {
    elements.loadMoreContainer.classList.remove('hidden');
  } else {
    elements.loadMoreContainer.classList.add('hidden');
  }
}

// Updated fetchProjects function with C++ fix
async function fetchProjects() {
  // Avoid rapid successive requests
  const now = Date.now();
  if (now - state.lastRequestTime < 1000) return;
  state.lastRequestTime = now;

  if (state.isLoading || (!state.hasMore && state.page > 1)) return;
  
  state.isLoading = true;
  showLoading(true);
  hideError();
  
  try {
    // Build query parameters
    let query = "";
    
    // Add the user's search query
    if (state.query) {
      query += state.query;
    }
    
    // Add language filter if selected
    if (state.selectedLanguages.length > 0) {
      if (query) query += " ";
      
      const language = state.selectedLanguages[0];
      // Handle special cases like C++
      if (language === "C++") {
        query += "language:cpp";
      } else if (language.includes(' ')) {
        // Wrap in quotes for languages with spaces
        query += `language:"${language}"`;
      } else {
        query += `language:${language}`;
      }
    }
    
    // Add issues filter
    if (state.minIssues > 0) {
      if (query) query += " ";
      query += `issues:>=${state.minIssues}`;
    }
    
    const sort = state.sort;
    const order = sort === 'updated' ? 'desc' : 'desc';
    const page = state.page;
    const perPage = state.perPage;
    
    // Encode the complete query
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.github.com/search/repositories?q=${encodedQuery}&sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Try again later or add a GitHub token.');
      } else if (response.status === 422) {
        throw new Error('Invalid search query. Please try different filters.');
      } else {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    state.totalCount = data.total_count;
    state.hasMore = (page * perPage) < data.total_count;
    
    if (page === 1) {
      elements.resultsContainer.innerHTML = '';
      cacheResults(data.items);
    }
    
    renderProjects(data.items);
    updateResultsInfo();
    
    if (data.items.length === 0 && page === 1) {
      showEmptyState(true);
    } else {
      showEmptyState(false);
    }
    
    if (state.hasMore) {
      showLoadMoreButton(true);
    } else {
      showLoadMoreButton(false);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    state.isLoading = false;
    showLoading(false);
  }
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) return;
  
  const fragment = document.createDocumentFragment();
  
  projects.forEach(project => {
    const card = createProjectCard(project);
    fragment.appendChild(card);
  });
  
  elements.resultsContainer.appendChild(fragment);
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'repo-card fade-in';
  
  const lastUpdated = new Date(project.updated_at).toLocaleDateString();
  const starsCount = project.stargazers_count >= 1000 
    ? `${(project.stargazers_count / 1000).toFixed(1)}k` 
    : project.stargazers_count;
  
  const forksCount = project.forks_count >= 1000 
    ? `${(project.forks_count / 1000).toFixed(1)}k` 
    : project.forks_count;
  
  const openIssues = project.open_issues_count >= 1000
    ? `${(project.open_issues_count / 1000).toFixed(1)}k`
    : project.open_issues_count;
  
  const languageColor = getLanguageColor(project.language);
  
  card.innerHTML = `
    <div class="card-content">
      <div class="repo-header">
        <img src="${project.owner.avatar_url}" alt="${project.owner.login}" class="avatar" loading="lazy">
        <div class="repo-info">
          <a href="${project.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name">${project.full_name}</a>
          ${project.archived ? '<span class="archived-badge">Archived</span>' : ''}
          <p class="repo-description">${project.description || 'No description provided'}</p>
        </div>
      </div>
      
      <div class="stats">
        ${project.language ? `
          <div class="stat">
            <span class="language-indicator" style="background-color: ${languageColor}"></span>
            <span>${project.language}</span>
          </div>
        ` : ''}
        <div class="stat">
          <i class="fas fa-star"></i>
          <span>${starsCount}</span>
        </div>
        <div class="stat">
          <i class="fas fa-code-branch"></i>
          <span>${forksCount}</span>
        </div>
        <div class="stat">
          <i class="fas fa-exclamation-circle"></i>
          <span>${openIssues}</span>
        </div>
      </div>
      
      ${project.topics && project.topics.length > 0 ? `
        <div class="topics">
          ${project.topics.slice(0, 5).map(topic => `
            <span class="topic-tag">${topic}</span>
          `).join('')}
          ${project.topics.length > 5 ? `<span class="more-topics">+${project.topics.length - 5} more</span>` : ''}
        </div>
      ` : ''}
      
      <div class="repo-footer">
        <div class="updated-date">
          <i class="fas fa-clock"></i>
          <span>Updated ${lastUpdated}</span>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

function getLanguageColor(language) {
  if (!language) return '#cccccc';
  
  const colors = {
    "JavaScript": '#f1e05a',
    "Python": '#3572A5',
    "Java": '#b07219',
    "TypeScript": '#3178c6',
    "C++": '#f34b7d',
    "C#": '#178600',
    "PHP": '#4F5D95',
    "Ruby": '#701516',
    "Go": '#00ADD8',
    "Swift": '#ffac45',
    "Kotlin": '#F18E33',
    "Rust": '#dea584',
    "Scala": '#c22d40',
    "Dart": '#00B4AB',
    "Elixir": '#6e4a7e',
    "R": '#198CE7',
    "MATLAB": '#e16737',
    "Perl": '#0298c3',
    "Lua": '#000080',
    "Haskell": '#5e5086',
    "SQL": '#e38c00',
    "Objective-C": '#438eff',
    "Groovy": '#4298b8',
    "Julia": '#a270ba',
    "Clojure": '#db5855',
    "Erlang": '#B83998',
    "F#": '#b845fc',
    "OCaml": '#3be133',
    "Scheme": '#1e4aec',
    "Prolog": '#74283c',
    "Solidity": '#AA6746',
    "VHDL": '#543978',
    "Verilog": '#848bf3',
    "Assembly": '#6E4C13',
    "COBOL": '#7F0A0C',
    "Fortran": '#4d41b1',
    "Lisp": '#3fb68b',
    "Delphi": '#b0ce4e',
    "PowerShell": '#012456',
    "Bash": '#89e051',
    "C": '#555555',
    "CoffeeScript": '#244776',
    "D": '#ba595e',
    "Elm": '#60B5CC',
    "Forth": '#341708',
    "Haxe": '#df7900',
    "Jupyter Notebook": '#DA5B0B',
    "LabVIEW": '#FFDB00',
    "Markdown": '#083fa1',
    "Nim": '#ffc200',
    "Octave": '#0790c0',
    "PL/SQL": '#dad8d8',
    "PostScript": '#da291c',
    "Puppet": '#FFAE1A',
    "Q#": '#fed659',
    "Racket": '#22228f',
    "Reason": '#ff5847',
    "Rexx": '#d90e09',
    "Ring": '#2D54CB',
    "SAS": '#B34936',
    "Smalltalk": '#596706',
    "Stata": '#1a365d',
    "Tcl": '#e4cc98',
    "TeX": '#3D6117',
    "Twig": '#c1d026',
    "VBScript": '#945db7',
    "Visual Basic": '#00539C',
    "WebAssembly": '#654FF0',
    "XSLT": '#EB8CEB',
    "YAML": '#cb171e',
    "Zig": '#ec915c',
    "ABAP": '#E8274B',
    "ActionScript": '#882B0F',
    "Ada": '#02f88c',
    "Apex": '#1797c0',
    "Arduino": '#bd79d1',
    "AutoHotkey": '#6594b9',
    "AutoIt": '#1C3552',
    "BlitzMax": '#cd6400',
    "Boo": '#d4bec1',
    "Ceylon": '#dfa535',
    "Chapel": '#8dc63f',
    "Clean": '#3F85AF',
    "ClojureScript": '#db5855',
    "Crystal": '#000100',
    "CUDA": '#3A4E3A',
    "Eiffel": '#946d57',
    "Emacs Lisp": '#c065db',
    "F*": '#572e30',
    "Factor": '#636746',
    "Fantom": '#14253c',
    "FLUX": '#33CCFF',
    "GDScript": '#355570',
    "Genie": '#fb855d',
    "Gherkin": '#5B2063',
    "Golo": '#88562A',
    "Gosu": '#82937f',
    "Grace": '#615f8b',
    "Hack": '#878787',
    "Harbour": '#0e60e3',
    "IDL": '#e3592c',
    "Io": '#a9188d',
    "J": '#9EEDFF',
    "Janet": '#0886a5',
    "Jolie": '#843179',
    "Joy": '#db7e00',
    "K": '#1F6AED',
    "Kotlin/Native": '#7f52ff',
    "LabVIEW G": '#FFDB00',
    "LiveScript": '#499886',
    "Logtalk": '#295b9a',
    "Maple": '#d94f53',
    "Mercury": '#ff2b2b',
    "Mirah": '#c7a938',
    "Modelica": '#de1d31',
    "Modula-3": '#223388',
    "Nemerle": '#0d3c6e',
    "NetLogo": '#ff6375',
    "Nial": '#3a8fba',
    "Nu": '#c9df40',
    "Oberon": '#fcd22a',
    "Object Pascal": '#f0a033',
    "Objective-J": '#ff0c5a',
    "OpenCL": '#ed2e2d',
    "Oz": '#fcd700',
    "ParaSail": '#6b8ba4',
    "Pike": '#005390',
    "Pony": '#e2a4be',
    "Pure Data": '#91de79',
    "PureScript": '#1D222D',
    "QML": '#44a51c',
    "Raku": '#0000fb',
    "Red": '#ee0000',
    "REBOL": '#358a5b',
    "Sather": '#3489ba',
    "Self": '#0579aa',
    "Simula": '#DC3741',
    "Slurm": '#1e90ff',
    "Snap!": '#ffe200',
    "SourcePawn": '#5c7611',
    "SPARK": '#3489ba',
    "Standard ML": '#dc566d',
    "SuperCollider": '#46390b',
    "SystemVerilog": '#DAE1C2',
    "TLA+": '#4b0076',
    "Unicon": '#6a8b97',
    "Vala": '#a56de2',
    "Vim script": '#199f4b',
    "Visual FoxPro": '#9783a0',
    "Wolfram Language": '#dd1100',
    "X10": '#4B6BEF',
    "XBase++": '#403a40',
    "XQuery": '#5232e7',
    "Xtend": '#24255d',
    "Zsh": '#89e051'
  };

  return colors[language] || '#cccccc';
}

function updateResultsInfo() {
  if (state.totalCount === 0) {
    elements.resultsCount.textContent = '';
    return;
  }
  
  const start = (state.page - 1) * state.perPage + 1;
  const end = Math.min(state.page * state.perPage, state.totalCount);
  
  elements.resultsCount.textContent = `Showing ${start}-${end} of ${state.totalCount.toLocaleString()} repositories`;
}

function loadMoreResults() {
  if (state.hasMore && !state.isLoading) {
    state.page += 1;
    fetchProjects();
  }
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const isNearBottom = scrollTop + clientHeight >= scrollHeight - 500;
  
  if (isNearBottom && state.hasMore && !state.isLoading) {
    loadMoreResults();
  }
}

function cacheResults(projects) {
  try {
    const cache = {
      timestamp: Date.now(),
      projects: projects,
      query: state.query,
      filters: {
        selectedLanguages: state.selectedLanguages,
        minIssues: state.minIssues,
        sort: state.sort
      }
    };
    
    localStorage.setItem('githubFinderCache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache results:', error);
  }
}

function checkForCachedResults() {
  try {
    const cache = localStorage.getItem('githubFinderCache');
    if (!cache) return;
    
    const parsedCache = JSON.parse(cache);
    const cacheAge = Date.now() - parsedCache.timestamp;
    const maxCacheAge = 30 * 60 * 1000; // 30 minutes
    
    if (cacheAge < maxCacheAge) {
      state.query = parsedCache.query;
      state.selectedLanguages = parsedCache.filters.selectedLanguages || [];
      state.minIssues = parsedCache.filters.minIssues || 0;
      state.sort = parsedCache.filters.sort || 'stars';
      
      // Update UI
      elements.searchInput.value = state.query;
      elements.issuesSlider.value = state.minIssues;
      elements.issuesValue.textContent = state.minIssues;
      document.querySelector(`input[name="sort"][value="${state.sort}"]`).checked = true;
      
      updateLanguageSelectionUI();
      
      renderProjects(parsedCache.projects);
      state.totalCount = parsedCache.projects.length;
      updateResultsInfo();
    }
  } catch (error) {
    console.error('Failed to load cached results:', error);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);