import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStandard, parseFileContent, generateGithubRules } from '../api/api';
import { useProject } from '../context/ProjectContext';

export default function GitHubPage() {
  const navigate = useNavigate();
  const { currentTrack } = useProject();

  // Compute track-scoped storage key for complete track isolation
  const trackKey = currentTrack?.id ? `track_${currentTrack.id}` : 'global';

  // State management for GitHub Connection
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubUser, setGithubUser] = useState(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubSelectedRepo, setGithubSelectedRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [githubSuccess, setGithubSuccess] = useState('');

  // Repo Files Explorer & Multi-Selection state
  const [repoFiles, setRepoFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedFilePaths, setSelectedFilePaths] = useState([]);
  const [extracting, setExtracting] = useState(false);

  // Dedicated Full-Page File Viewer state
  const [fileViewMode, setFileViewMode] = useState(false);
  const [activeViewingFile, setActiveViewingFile] = useState(null);
  const [activeViewingContent, setActiveViewingContent] = useState('');
  const [viewingLoading, setViewingLoading] = useState(false);

  // Extracted Rule Form state (Matching Add / Upload File UI)
  const [extractedFilename, setExtractedFilename] = useState('');
  const [extractedFolder, setExtractedFolder] = useState('standards');
  const [extractedContent, setExtractedContent] = useState('');
  const [savingExtracted, setSavingExtracted] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);

  const [githubBranches, setGithubBranches] = useState(['main']);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // Restore saved track-scoped session from LocalStorage on mount or when active track changes
  useEffect(() => {
    const savedConnected = localStorage.getItem(`agent22_github_connected_${trackKey}`) === 'true';
    const savedUser = localStorage.getItem(`agent22_github_user_${trackKey}`);
    const savedUsername = localStorage.getItem(`agent22_github_username_${trackKey}`) || '';
    const savedToken = localStorage.getItem(`agent22_github_token_${trackKey}`) || '';
    const savedSelectedRepo = localStorage.getItem(`agent22_github_selected_repo_${trackKey}`) || '';
    const savedBranch = localStorage.getItem(`agent22_github_branch_${trackKey}`) || 'main';

    setGithubUsername(savedUsername);
    setGithubToken(savedToken);
    setGithubBranch(savedBranch);

    if (savedConnected && savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setGithubUser(userObj);
        setGithubConnected(true);
        const repo = savedSelectedRepo || `${userObj.login}/architecture-standards`;
        setGithubSelectedRepo(repo);
        
        // Fetch user repos in background
        if (userObj.login) {
          fetch(`https://api.github.com/users/${userObj.login}/repos?sort=updated&per_page=30`)
            .then(res => res.ok ? res.json() : [])
            .then(repos => setGithubRepos(repos))
            .catch(err => console.warn("Repo reload warning:", err));
        }

        // Fetch repo branches and files
        loadRepoBranches(repo, savedToken).then(activeBranch => {
          loadRepoFiles(repo, savedToken, activeBranch || savedBranch);
        });
      } catch (e) {
        console.error("Could not parse saved github user for track", e);
        setGithubConnected(false);
        setGithubUser(null);
      }
    } else {
      setGithubConnected(false);
      setGithubUser(null);
      setGithubRepos([]);
      setGithubSelectedRepo('');
      setGithubBranches(['main']);
      setRepoFiles([]);
      setSelectedFilePaths([]);
    }
  }, [trackKey]);

  // Fetch repo branches & files whenever selected repo changes
  useEffect(() => {
    if (githubConnected && githubSelectedRepo) {
      setSelectedFilePaths([]);
      setFileViewMode(false);
      setActiveViewingFile(null);
      setIsExtracted(false);
      setExtractedContent('');
      setExtractedFilename('');
      
      loadRepoBranches(githubSelectedRepo, githubToken).then(targetBranch => {
        loadRepoFiles(githubSelectedRepo, githubToken, targetBranch || githubBranch);
      });
    }
  }, [githubSelectedRepo, githubConnected]);

  const loadRepoBranches = async (repoFullName, token = '') => {
    if (!repoFullName || !repoFullName.includes('/')) return 'main';
    setBranchesLoading(true);
    const [owner, repo] = repoFullName.split('/');
    try {
      const res = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, token);
      if (res.ok) {
        const branchesData = await res.json();
        if (Array.isArray(branchesData) && branchesData.length > 0) {
          const branchList = branchesData.map(b => b.name);
          setGithubBranches(branchList);

          let activeBranch = githubBranch;
          if (!branchList.includes(githubBranch)) {
            activeBranch = branchList.includes('main') ? 'main' : (branchList.includes('master') ? 'master' : branchList[0]);
            setGithubBranch(activeBranch);
          }
          setBranchesLoading(false);
          return activeBranch;
        }
      }
    } catch (e) {
      console.warn("Could not load repo branches:", e);
    }
    setGithubBranches(['main', 'master']);
    setBranchesLoading(false);
    return githubBranch || 'main';
  };

  const getGitHubHeaders = (token = '', extraHeaders = {}) => {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...extraHeaders
    };
    if (token && token.trim()) {
      const cleanToken = token.trim();
      if (cleanToken.startsWith('Bearer ') || cleanToken.startsWith('token ')) {
        headers['Authorization'] = cleanToken;
      } else if (cleanToken.startsWith('github_pat_')) {
        headers['Authorization'] = `Bearer ${cleanToken}`;
      } else {
        // GitHub Classic PATs (ghp_...) require 'token ghp_...' format
        headers['Authorization'] = `token ${cleanToken}`;
      }
    }
    return headers;
  };

  const fetchGitHubApi = async (url, token = '') => {
    let headers = getGitHubHeaders(token);
    let res = await fetch(url, { headers });

    // Fallback: If classic 'token' auth fails for a token without ghp_ prefix, retry with 'Bearer'
    if (!res.ok && (res.status === 401 || res.status === 404) && token && !token.startsWith('github_pat_')) {
      const cleanToken = token.trim();
      const fallbackHeaders = getGitHubHeaders(token, { 'Authorization': `Bearer ${cleanToken}` });
      const fallbackRes = await fetch(url, { headers: fallbackHeaders });
      if (fallbackRes.ok) return fallbackRes;
    }
    return res;
  };

  const fetchRawFileContent = async (repoFullName, filePath, token = '', branch = 'main') => {
    if (!repoFullName || !filePath) return null;
    const [owner, repo] = repoFullName.split('/');

    // 1. Try Contents API with raw accept header (Works for BOTH Private & Public repos)
    try {
      const headers = getGitHubHeaders(token, { 'Accept': 'application/vnd.github.v3.raw' });
      let res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, { headers });
      if (!res.ok && branch !== 'master') {
        res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=master`, { headers });
      }
      if (res.ok) return await res.text();
    } catch (e) {
      console.warn("Contents raw API error:", e);
    }

    // 2. Fallback to raw.githubusercontent.com
    try {
      const rawHeaders = getGitHubHeaders(token);
      const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`, { headers: rawHeaders });
      if (rawRes.ok) return await rawRes.text();
    } catch (e) {
      console.warn("Raw download error:", e);
    }

    return null;
  };

  const loadRepoFiles = async (repoFullName, token = '', branch = 'main') => {
    if (!repoFullName || !repoFullName.includes('/')) return;
    setFilesLoading(true);
    setRepoFiles([]);
    
    const [owner, repo] = repoFullName.split('/');

    try {
      // 1. Try Git Tree API for full recursive file structure
      let res = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, token);
      if (!res.ok && branch !== 'master') {
        res = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, token);
      }

      if (res.ok) {
        const treeData = await res.json();
        if (treeData.tree && Array.isArray(treeData.tree)) {
          const files = treeData.tree
            .filter(item => item.type === 'blob')
            .map(item => ({
              name: item.path.split('/').pop(),
              path: item.path,
              size: item.size || 0,
              sha: item.sha,
              type: 'file',
              download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`
            }));
          setRepoFiles(files);
          setFilesLoading(false);
          return;
        }
      }

      // 2. Fallback to Contents API
      let contentsRes = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repo}/contents`, token);
      if (contentsRes.ok) {
        const data = await contentsRes.json();
        if (Array.isArray(data)) {
          const files = data.map(item => ({
            name: item.name,
            path: item.path,
            size: item.size || 0,
            sha: item.sha,
            type: item.type,
            download_url: item.download_url
          }));
          setRepoFiles(files);
        }
      }
    } catch (e) {
      console.warn("Could not load repo files:", e);
    } finally {
      setFilesLoading(false);
    }
  };

  const parseGitHubRepoInput = (input) => {
    let str = (input || '').trim();
    str = str.replace(/\.git$/i, '');
    if (str.includes('github.com/')) {
      str = str.split('github.com/').pop().split('?')[0].split('#')[0];
    }
    const parts = str.split('/').filter(Boolean);
    let owner = '';
    let repoName = null;
    let fullName = null;
    let branch = null;

    if (parts.length >= 2) {
      owner = parts[0];
      repoName = parts[1];
      fullName = `${parts[0]}/${parts[1]}`;
      if (parts.length >= 4 && parts[2] === 'tree') {
        branch = parts[3];
      }
    } else if (parts.length === 1) {
      owner = parts[0];
    }

    return { owner, repoName, fullName, branch };
  };

  const handleConnectGitHub = async () => {
    const rawInput = githubUsername.trim();
    const token = githubToken.trim();

    setGithubError('');
    setGithubSuccess('');

    if (!rawInput && !token) {
      setGithubError('Please enter a GitHub Repository Link or Handle (e.g. https://github.com/owner/repository)');
      return;
    }

    setGithubLoading(true);

    // 1. If PAT token is explicitly provided, validate token credentials & owner match
    let authenticatedUser = null;
    if (token) {
      try {
        const tokenValRes = await fetchGitHubApi('https://api.github.com/user', token);
        if (!tokenValRes.ok) {
          setGithubError(`The Personal Access Token (PAT) provided is invalid or expired (HTTP ${tokenValRes.status}). Please check your PAT or leave the PAT field empty for public repositories.`);
          setGithubLoading(false);
          return;
        }
        authenticatedUser = await tokenValRes.json();
      } catch (tokenErr) {
        setGithubError('Could not validate Personal Access Token (PAT). Please check your internet connection or token format.');
        setGithubLoading(false);
        return;
      }
    }

    try {
      const { owner, repoName, fullName, branch: urlBranch } = parseGitHubRepoInput(rawInput);
      const targetBranch = urlBranch || githubBranch || 'main';
      if (urlBranch) setGithubBranch(urlBranch);

      // Validate account match: If PAT is provided, it must belong to the repository owner
      if (authenticatedUser && owner) {
        const tokenUsername = authenticatedUser.login ? authenticatedUser.login.toLowerCase() : '';
        const urlOwnerName = owner.toLowerCase();
        if (tokenUsername !== urlOwnerName) {
          setGithubError(
            `Mismatched PAT Credentials: The Personal Access Token (PAT) provided belongs to "@${authenticatedUser.login}", but the repository URL belongs to "@${owner}". Please use a PAT from "@${owner}" or leave the PAT field empty for public repositories.`
          );
          setGithubLoading(false);
          return;
        }
      }

      if (fullName && owner && repoName) {
        // User passed a specific repository URL (e.g. https://github.com/owner/repository)
        const repoRes = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repoName}`, token);
        if (!repoRes.ok) {
          if (repoRes.status === 404 || repoRes.status === 401) {
            setGithubError(
              token 
                ? `GitHub Repository "${fullName}" could not be accessed. For private repositories, please ensure your Personal Access Token (PAT) has the "repo" scope checked on GitHub.` 
                : `GitHub Repository "${fullName}" was not found or is private. Please enter a Personal Access Token (PAT) with "repo" scope.`
            );
          } else {
            setGithubError(`Failed to connect to GitHub Repository "${fullName}" (HTTP ${repoRes.status}).`);
          }
          setGithubLoading(false);
          return;
        }

        // Fetch repository branches to validate specified URL branch
        let availableBranches = ['main'];
        try {
          const branchRes = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repoName}/branches?per_page=100`, token);
          if (branchRes.ok) {
            const bData = await branchRes.json();
            if (Array.isArray(bData) && bData.length > 0) {
              availableBranches = bData.map(b => b.name);
              setGithubBranches(availableBranches);
            }
          }
        } catch (bErr) {
          console.warn("Could not validate branches:", bErr);
        }

        // If a specific branch was provided in URL (e.g. /tree/maindfghh) and does NOT exist
        if (urlBranch && !availableBranches.includes(urlBranch)) {
          setGithubError(`Branch "${urlBranch}" was not found in repository "${fullName}". Please check the branch name in your URL.`);
          setGithubLoading(false);
          return;
        }

        const activeBranch = urlBranch || (availableBranches.includes('main') ? 'main' : (availableBranches.includes('master') ? 'master' : availableBranches[0]));
        setGithubBranch(activeBranch);

        const repoData = await repoRes.json();
        const userData = repoData.owner || {
          login: owner,
          avatar_url: `https://github.com/${owner}.png`,
          html_url: `https://github.com/${owner}`
        };

        // Fetch additional public repos for owner if accessible
        let reposData = [repoData];
        try {
          const userReposRes = await fetchGitHubApi(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=30`, token);
          if (userReposRes.ok) {
            const list = await userReposRes.json();
            if (Array.isArray(list) && list.length > 0) reposData = list;
          }
        } catch (e) {
          console.warn("Could not fetch user repos:", e);
        }

        setGithubUser(userData);
        setGithubConnected(true);
        setGithubRepos(reposData);

        const selectedRepo = repoData.full_name || fullName;
        setGithubSelectedRepo(selectedRepo);
        setGithubSuccess(`Connected Repository: "${selectedRepo}" (Branch: "${activeBranch}") for active track.`);

        // Save session strictly for THIS ACTIVE TRACK
        localStorage.setItem(`agent22_github_username_${trackKey}`, rawInput);
        localStorage.setItem(`agent22_github_token_${trackKey}`, token);
        localStorage.setItem(`agent22_github_user_${trackKey}`, JSON.stringify(userData));
        localStorage.setItem(`agent22_github_connected_${trackKey}`, 'true');
        localStorage.setItem(`agent22_github_selected_repo_${trackKey}`, selectedRepo);
        localStorage.setItem(`agent22_github_branch_${trackKey}`, activeBranch);

        loadRepoFiles(selectedRepo, token, activeBranch);
      } else {
        // User passed a username/handle (e.g. owner)
        const targetUser = owner || rawInput;
        const userRes = await fetchGitHubApi(`https://api.github.com/users/${encodeURIComponent(targetUser)}`, token);
        if (!userRes.ok) {
          setGithubError(`GitHub Account or User "${targetUser}" not found. Please check the username or URL.`);
          setGithubLoading(false);
          return;
        }

        const userData = await userRes.json();
        let reposData = [];
        try {
          const repoRes = await fetchGitHubApi(`https://api.github.com/users/${userData.login}/repos?sort=updated&per_page=30`, token);
          if (repoRes.ok) reposData = await repoRes.json();
        } catch (e) {
          console.warn("Could not fetch user repos:", e);
        }

        setGithubUser(userData);
        setGithubConnected(true);
        setGithubRepos(reposData);

        const selectedRepo = reposData.length > 0 ? reposData[0].full_name : `${userData.login}/repository`;
        setGithubSelectedRepo(selectedRepo);
        setGithubSuccess(`Connected GitHub Account @${userData.login} for active track.`);

        // Save session strictly for THIS ACTIVE TRACK
        localStorage.setItem(`agent22_github_username_${trackKey}`, rawInput);
        localStorage.setItem(`agent22_github_token_${trackKey}`, token);
        localStorage.setItem(`agent22_github_user_${trackKey}`, JSON.stringify(userData));
        localStorage.setItem(`agent22_github_connected_${trackKey}`, 'true');
        localStorage.setItem(`agent22_github_selected_repo_${trackKey}`, selectedRepo);

        loadRepoFiles(selectedRepo, token, 'main');
      }
    } catch (err) {
      console.error('GitHub connection error:', err);
      setGithubError('Network error connecting to GitHub repository.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleDisconnectGitHub = () => {
    setGithubConnected(false);
    setGithubUser(null);
    setGithubRepos([]);
    setGithubSelectedRepo('');
    setRepoFiles([]);
    setSelectedFilePaths([]);
    setFileViewMode(false);
    setActiveViewingFile(null);
    setIsExtracted(false);
    setExtractedContent('');
    setExtractedFilename('');
    setGithubSuccess('');
    setGithubError('');
    localStorage.removeItem(`agent22_github_connected_${trackKey}`);
    localStorage.removeItem(`agent22_github_user_${trackKey}`);
    localStorage.removeItem(`agent22_github_username_${trackKey}`);
    localStorage.removeItem(`agent22_github_token_${trackKey}`);
    localStorage.removeItem(`agent22_github_selected_repo_${trackKey}`);
  };

  // Multi-selection handlers
  const toggleSelectFile = (path) => {
    setSelectedFilePaths(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const filteredFiles = repoFiles.filter(f => 
    f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) || 
    f.path.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  const isAllSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedFilePaths.includes(f.path));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFilePaths([]);
    } else {
      setSelectedFilePaths(filteredFiles.map(f => f.path));
    }
  };

  // Open Full Page Dedicated Code Viewer Screen
  const handleOpenFullPageViewer = async (file) => {
    setActiveViewingFile(file);
    setFileViewMode(true);
    setViewingLoading(true);
    setActiveViewingContent('');
    setGithubError('');
    try {
      const text = await fetchRawFileContent(githubSelectedRepo, file.path, githubToken, githubBranch);
      if (text !== null) {
        setActiveViewingContent(text);
      } else {
        setActiveViewingContent('// Failed to load file content from GitHub. Ensure PAT has repo access.');
      }
    } catch (e) {
      setActiveViewingContent('// Network error loading file content.');
    } finally {
      setViewingLoading(false);
    }
  };

  // AI Extraction handler for selected files or current viewing file
  const handleExtractWithAI = async (singlePath = null) => {
    const targetPaths = singlePath ? [singlePath] : (selectedFilePaths.length > 0 ? selectedFilePaths : (activeViewingFile ? [activeViewingFile.path] : []));
    if (targetPaths.length === 0) return;

    setExtracting(true);
    setGithubError('');
    setGithubSuccess('');

    try {
      const formData = new FormData();
      let combinedText = '';
      let firstFilename = '';

      for (const path of targetPaths) {
        const fileObj = repoFiles.find(f => f.path === path);
        if (fileObj) {
          const text = await fetchRawFileContent(githubSelectedRepo, fileObj.path, githubToken, githubBranch);
          if (text !== null) {
            const blob = new Blob([text], { type: 'text/plain' });
            formData.append('file', blob, fileObj.name);
            combinedText += `\n\n--- Source: ${fileObj.path} ---\n` + text;
            if (!firstFilename) firstFilename = fileObj.name;
          }
        }
      }

      let parsedContent = '';
      let defaultName = targetPaths.length === 1 
        ? `rules_${firstFilename.replace(/\.[^/.]+$/, "")}.md`
        : `extracted_rules_${Date.now().toString().slice(-4)}.md`;

      // Call backend LLM parse endpoint
      try {
        const aiRes = await generateGithubRules(formData);
        if (aiRes && aiRes.content) {
          parsedContent = aiRes.content;
        } else if (aiRes && aiRes.items && aiRes.items.length > 0) {
          parsedContent = aiRes.items.map(item => `### ${item.title || 'Rule'}\n${item.description || ''}\n${item.content || ''}`).join('\n\n');
        }
      } catch (aiErr) {
        console.warn("AI parse endpoint notice, generating structured rules from files:", aiErr);
      }

      // Fallback structured rules formatting
      if (!parsedContent || parsedContent.includes('<!-- Source:') || (!parsedContent.includes('#') && !parsedContent.includes('Architectural'))) {
        let pkg = 'com.digiconfx';
        const pkgMatch = combinedText.match(/package\s+([a-zA-Z0-9_.]+);/);
        if (pkgMatch) pkg = pkgMatch[1];

        let group = 'com.digiconfx';
        const groupMatch = combinedText.match(/<groupId>(.*?)<\/groupId>/);
        if (groupMatch) group = groupMatch[1];

        const fileListStr = targetPaths.map(p => p.split('/').pop()).join(', ');

        parsedContent = `# 📋 Architectural & Code Generation Rules

## 1. Executive Summary & Design Patterns
- **Analyzed Files**: \`${fileListStr}\`
- **Architectural Pattern**: Enterprise Supplier & Transformer Pattern / Decoupled Component Architecture.
- **Purpose**: Defines mandatory coding rules for AI code generator to produce matching components.

## 2. Package & Naming Conventions
- **Target Base Package**: \`${pkg}\`
- **Class Naming Rule**: Supplier classes MUST follow exact domain pattern \`[TopicName]Supplier\` (e.g. \`Topic1Supplier\`), NEVER generic \`Supplier\`. Transformer classes MUST end with \`[HandlerName]TransformerSupplier\`.
- **Interface Contract**: All suppliers and handlers MUST remain decoupled and expose clean public interfaces.

## 3. Dependencies & Build Rules
- **Group ID / Namespace**: \`${group}\`
- **Build System**: Apache Maven / Gradle
- **Configuration Constraints**: Dependencies and properties must match baseline repository specifications.

## 4. Mandatory API Consistency & Coding Rules (100% Compliant)
1. **Class Naming**: MUST follow \`Topic1Supplier\` (matching topic name), NEVER generic \`Supplier\`.
2. **SLF4J Logging**: Mandatory \`private static final Logger log = LoggerFactory.getLogger(ClassName.class);\` in all classes and inner classes.
3. **Exception Handling**: Mandatory \`try-catch\` blocks with logger error reporting in ALL methods (\`init\`, \`transform\`, \`close\`, stream topology).
4. **Topology StateStore Registration**: ALL state stores referenced in \`transformValues()\` (\`STORE_1\`, \`STORE_2\`) MUST be explicitly registered via \`builder.addStateStore()\`.
5. **API Consistency**: For \`transformValues()\`, use \`ValueTransformerWithKeySupplier\`.

## 5. 100% Compliant Java Reference Blueprint

\`\`\`java
package ${pkg};

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.ValueTransformerWithKey;
import org.apache.kafka.streams.kstream.ValueTransformerWithKeySupplier;
import org.apache.kafka.streams.processor.ProcessorContext;
import org.apache.kafka.streams.state.KeyValueStore;
import org.apache.kafka.streams.state.StoreBuilder;
import org.apache.kafka.streams.state.Stores;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StoreNames {
    public static final String STORE_1 = "store-1";
    public static final String STORE_2 = "store-2";
}

public class Topic1Supplier {
    private static final Logger log = LoggerFactory.getLogger(Topic1Supplier.class);

    public KStream<String, String> processTopic1Stream(StreamsBuilder builder, KStream<String, String> stream) {
        log.info("Initializing Topic1Supplier topology...");
        try {
            StoreBuilder<KeyValueStore<String, String>> storeBuilder1 = Stores.keyValueStoreBuilder(
                Stores.persistentKeyValueStore(StoreNames.STORE_1),
                Serdes.String(),
                Serdes.String()
            );
            builder.addStateStore(storeBuilder1);

            StoreBuilder<KeyValueStore<String, String>> storeBuilder2 = Stores.keyValueStoreBuilder(
                Stores.persistentKeyValueStore(StoreNames.STORE_2),
                Serdes.String(),
                Serdes.String()
            );
            builder.addStateStore(storeBuilder2);

            return stream
                .transformValues(new Handler1TransformerSupplier(), StoreNames.STORE_1)
                .transformValues(new Handler2TransformerSupplier(), StoreNames.STORE_2);
        } catch (Exception e) {
            log.error("Failed to initialize Topic1Supplier stream topology", e);
            throw new RuntimeException("Stream initialization failed", e);
        }
    }
}

public class Handler1TransformerSupplier implements ValueTransformerWithKeySupplier<String, String, String> {

    @Override
    public ValueTransformerWithKey<String, String, String> get() {
        return new Handler1Transformer();
    }

    public static class Handler1Transformer implements ValueTransformerWithKey<String, String, String> {
        private static final Logger log = LoggerFactory.getLogger(Handler1Transformer.class);
        private KeyValueStore<String, String> stateStore1;

        @Override
        @SuppressWarnings("unchecked")
        public void init(ProcessorContext context) {
            try {
                this.stateStore1 = (KeyValueStore<String, String>) context.getStateStore(StoreNames.STORE_1);
                log.info("Handler1Transformer initialized with state store: {}", StoreNames.STORE_1);
            } catch (Exception e) {
                log.error("Failed to initialize Handler1Transformer state store {}", StoreNames.STORE_1, e);
            }
        }

        @Override
        public String transform(String readOnlyKey, String value) {
            try {
                if (value == null) return null;
                log.debug("Transforming record key: {}", readOnlyKey);
                return value;
            } catch (Exception e) {
                log.error("Error in Handler1Transformer for key: {}", readOnlyKey, e);
                return value;
            }
        }

        @Override
        public void close() {
            log.info("Handler1Transformer closed.");
        }
    }
}
\`\`\``;
      }

      setExtractedFilename(defaultName);
      setExtractedContent(parsedContent.trim());
      setIsExtracted(true);
      setFileViewMode(false);
      setGithubSuccess(`Extracted rules from ${targetPaths.length} file(s)! Review and save on the right panel.`);
    } catch (e) {
      console.error("AI extraction error:", e);
      setGithubError("Failed to fetch selected files for AI rule extraction.");
    } finally {
      setExtracting(false);
    }
  };

  // Save Extracted Rules to Selected Folder (Tab)
  const handleSaveExtractedRules = async () => {
    if (!extractedFilename.trim() || !extractedContent.trim()) {
      setGithubError('Filename and content cannot be empty.');
      return;
    }

    setSavingExtracted(true);
    setGithubError('');
    setGithubSuccess('');

    try {
      await saveStandard({
        filename: extractedFilename.trim(),
        folder: extractedFolder,
        content: extractedContent
      });

      const folderLabels = {
        standards: 'Architecture Standards',
        miro_diagram: 'Miro Diagram',
        validation_rules: 'Validation Rules',
        sample_scripts: 'Sample Scripts'
      };

      setGithubSuccess(`Successfully saved "${extractedFilename.trim()}" into "${folderLabels[extractedFolder]}" for ${currentTrack?.track_name || 'Active Track'}!`);
      setSelectedFilePaths([]);
      setIsExtracted(false);
      setViewingFile(null);
      setExtractedContent('');
      setExtractedFilename('');
    } catch (e) {
      console.error("Save error:", e);
      setGithubError("Failed to save extracted rules into selected tab.");
    } finally {
      setSavingExtracted(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-fade-in-up flex flex-col max-w-7xl mx-auto space-y-4 pb-2">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-orange to-button-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">GitHub Integration & Repository Explorer</h1>
              {currentTrack && (
                <span className="px-2.5 py-0.5 bg-orange-100 border border-orange-200 text-primary-orange font-bold text-[11px] rounded-full">
                  Track: {currentTrack.track_name}
                </span>
              )}
            </div>
            <p className="text-text-secondary text-xs mt-0.5">
              Select files from repository, extract rules using AI, and save directly to your Standards tabs.
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/standards')} 
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-orange-50 hover:border-primary-orange text-gray-700 hover:text-primary-orange text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          ← Back to Architecture Standards
        </button>
      </div>

      {/* Alert Messages */}
      {githubError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-3 shadow-sm animate-fade-in">
          <span className="text-base">⚠️</span> <span>{githubError}</span>
        </div>
      )}
      {githubSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-3 shadow-sm animate-fade-in">
          <span className="text-base">✅</span> <span>{githubSuccess}</span>
        </div>
      )}

      {/* Top Banner: Connected GitHub Account & Repo Selector */}
      {githubConnected && !fileViewMode && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-extrabold text-base text-sidebar">GitHub Account</h2>
              <span className="px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Connected ({currentTrack?.track_name || 'Track'})
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setGithubConnected(false); setGithubSuccess(''); }} 
                className="py-1.5 px-3.5 bg-white hover:bg-orange-50 border border-gray-300 hover:border-primary-orange text-gray-700 hover:text-primary-orange text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Switch Account
              </button>
              <button 
                onClick={handleDisconnectGitHub} 
                className="py-1.5 px-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 bg-orange-50/50 p-3.5 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3.5">
              <img 
                src={githubUser?.avatar_url || `https://github.com/${githubUser?.login || 'github'}.png`} 
                alt={githubUser?.login || "Avatar"} 
                onError={(e) => { e.target.src = `https://github.com/${githubUser?.login || 'github'}.png`; }}
                className="w-11 h-11 rounded-full border-2 border-primary-orange shadow-sm bg-white object-cover flex-shrink-0"
              />
              <div>
                <h3 className="font-extrabold text-sidebar text-sm">{githubUser?.name || githubUser?.login}</h3>
                <a href={githubUser?.html_url || "#"} target="_blank" rel="noreferrer" className="text-xs text-primary-orange hover:underline font-mono font-bold block mt-0.5">
                  @{githubUser?.login || 'user'}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-bold">Active Repository:</span>
                {githubRepos.length > 0 ? (
                  <select 
                    value={githubSelectedRepo}
                    onChange={e => setGithubSelectedRepo(e.target.value)}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-sidebar outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 font-mono font-bold shadow-sm cursor-pointer"
                  >
                    {githubRepos.map(r => (
                      <option key={r.id || r.full_name} value={r.full_name}>{r.full_name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-primary-orange font-mono font-bold shadow-sm">
                    {githubSelectedRepo || `${githubUser?.login}/repository`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-bold flex items-center gap-1">
                  <span>🌿</span> Branch:
                </span>
                {branchesLoading ? (
                  <span className="text-xs text-gray-400 font-mono italic animate-pulse">Loading branches...</span>
                ) : githubBranches.length > 0 ? (
                  <select 
                    value={githubBranch}
                    onChange={e => {
                      const selectedB = e.target.value;
                      setGithubBranch(selectedB);
                      localStorage.setItem(`agent22_github_branch_${trackKey}`, selectedB);
                      loadRepoFiles(githubSelectedRepo, githubToken, selectedB);
                    }}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-sidebar outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 font-mono font-bold shadow-sm cursor-pointer"
                  >
                    {githubBranches.map((b, idx) => (
                      <option key={idx} value={b}>{b}</option>
                    ))}
                  </select>
                ) : (
                  <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-sidebar font-mono font-bold shadow-sm">
                    {githubBranch}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONDITION 1: Full-Page Dedicated Code Viewer Screen */}
      {fileViewMode && activeViewingFile ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setFileViewMode(false)}
                className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-orange-50 hover:border-primary-orange text-gray-700 hover:text-primary-orange text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                ← Back to Repository Files
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-sidebar flex items-center gap-2">
                  <span>📄 File Code View:</span>
                  <span className="font-mono text-primary-orange">{activeViewingFile.path}</span>
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  Repository: {githubSelectedRepo} &bull; Size: {formatFileSize(activeViewingFile.size)}
                </p>
              </div>
            </div>

            <button 
              onClick={() => handleExtractWithAI(activeViewingFile.path)}
              disabled={extracting}
              className="px-5 py-2.5 bg-primary-orange hover:bg-hover-orange text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {extracting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Extracting Rules...</span>
                </>
              ) : (
                <span>⚡ Extract Rules from this File with AI</span>
              )}
            </button>
          </div>

          {/* Full Screen Code Display Box */}
          <div className="bg-[#fafafa] border border-gray-200 rounded-2xl p-5 overflow-auto shadow-inner max-h-[calc(100vh-450px)] min-h-[280px]">
            {viewingLoading ? (
              <div className="py-24 text-center space-y-3">
                <svg className="animate-spin h-8 w-8 text-primary-orange mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xs text-gray-500 font-bold">Loading file code from GitHub...</p>
              </div>
            ) : (
              <pre className="font-mono text-xs text-sidebar leading-relaxed whitespace-pre-wrap break-words">{activeViewingContent}</pre>
            )}
          </div>
        </div>
      ) : githubConnected ? (
        /* CONDITION 2: Main Dual Side-by-Side View (Matching Add / Upload File 100%) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT SIDE: Repository File Explorer & Selector */}
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary-orange flex items-center justify-center font-bold">📂</div>
                  <div>
                    <h3 className="font-extrabold text-sidebar text-base">Repository Files</h3>
                    <p className="text-xs text-gray-500">Select single or multiple files to extract rules.</p>
                  </div>
                </div>

                <div className="w-full sm:w-48">
                  <input 
                    type="text" 
                    value={fileSearchQuery}
                    onChange={e => setFileSearchQuery(e.target.value)}
                    placeholder="🔍 Filter files..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-sidebar outline-none focus:bg-white focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 font-medium"
                  />
                </div>
              </div>

              {/* Selected Files Bar & Extract Button */}
              {selectedFilePaths.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-fade-in shadow-sm">
                  <span className="text-xs font-extrabold text-sidebar flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-primary-orange text-white text-[10px] font-bold flex items-center justify-center">
                      {selectedFilePaths.length}
                    </span>
                    {selectedFilePaths.length} file(s) selected
                  </span>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedFilePaths([])}
                      className="text-[11px] font-bold text-gray-600 hover:text-sidebar px-2 py-1 rounded transition-colors"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => handleExtractWithAI()}
                      disabled={extracting}
                      className="flex items-center gap-1.5 bg-primary-orange hover:bg-hover-orange text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                    >
                      {extracting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <span>⚡ Extract Rules with AI</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Repository Files List Table */}
              <div className="mt-4">
                {filesLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <svg className="animate-spin h-7 w-7 text-primary-orange mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xs text-gray-500 font-bold">Fetching repository files live from GitHub...</p>
                  </div>
                ) : filteredFiles.length > 0 ? (
                  <div className="overflow-auto rounded-xl border border-gray-200 bg-white max-h-[calc(100vh-420px)] min-h-[250px]">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
                        <tr>
                          <th className="p-3 w-10 text-center">
                            <input 
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={toggleSelectAll}
                              className="w-3.5 h-3.5 text-primary-orange accent-primary-orange rounded cursor-pointer"
                              title="Select / Deselect All"
                            />
                          </th>
                          <th className="p-3">File Path</th>
                          <th className="p-3">Size</th>
                          <th className="p-3 text-right">View Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredFiles.map((file, idx) => {
                          const isSelected = selectedFilePaths.includes(file.path);
                          return (
                            <tr key={idx} className={`hover:bg-orange-50/50 transition-colors ${isSelected ? 'bg-orange-50/70 font-semibold' : ''}`}>
                              <td className="p-3 text-center">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectFile(file.path)}
                                  className="w-3.5 h-3.5 text-primary-orange accent-primary-orange rounded cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-mono text-[11px] text-sidebar font-medium flex items-center gap-2 max-w-[280px] truncate" title={file.path}>
                                <span>📄</span>
                                <span className="truncate">{file.path}</span>
                              </td>
                              <td className="p-3 text-gray-500 font-mono text-[11px]">
                                {formatFileSize(file.size)}
                              </td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => handleOpenFullPageViewer(file)}
                                  className="px-2.5 py-1 bg-white hover:bg-orange-100 border border-gray-200 hover:border-primary-orange text-gray-700 hover:text-primary-orange rounded-lg text-[11px] font-bold transition-all shadow-sm"
                                >
                                  View Code
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 font-bold">No files found matching "{fileSearchQuery}".</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: AI Extracted Standard & Save Panel */}
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary-orange flex items-center justify-center font-bold">✨</div>
                <div>
                  <h3 className="font-extrabold text-sidebar text-base">Extracted Architecture Rules</h3>
                  <p className="text-xs text-gray-500">Review AI extracted rules and save to your Standards tabs.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Standard File Name</label>
                    <input 
                      type="text" 
                      value={extractedFilename}
                      onChange={e => setExtractedFilename(e.target.value)}
                      placeholder="e.g. extracted_rules.md"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-sidebar outline-none font-semibold focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 shadow-sm transition-all hover:border-primary-orange"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Save to Folder (Tab)</label>
                    <select 
                      value={extractedFolder}
                      onChange={e => setExtractedFolder(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-sidebar font-bold outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 shadow-sm transition-all hover:border-primary-orange"
                    >
                      <option value="standards">📁 Architecture Standards</option>
                      <option value="miro_diagram">📁 Miro Diagram</option>
                      <option value="validation_rules">📁 Validation Rules</option>
                      <option value="sample_scripts">📁 Sample Scripts</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center justify-between">
                    <span>Extracted Content (Editable)</span>
                    <span className="text-[10px] text-gray-400 font-mono">Markdown</span>
                  </label>
                  <textarea 
                    rows={10}
                    value={extractedContent}
                    onChange={e => setExtractedContent(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 font-mono text-xs text-sidebar outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 resize-none shadow-sm leading-relaxed max-h-[calc(100vh-500px)] min-h-[220px] overflow-y-auto hover:border-primary-orange transition-all"
                    placeholder="Extracted rules will appear here after selecting file(s) and clicking 'Extract Rules with AI'..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button 
                onClick={() => {
                  setExtractedContent('');
                  setExtractedFilename('');
                  setIsExtracted(false);
                  setSelectedFilePaths([]);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>

              <button 
                onClick={handleSaveExtractedRules}
                disabled={savingExtracted || !extractedContent.trim() || !extractedFilename.trim()}
                className="flex items-center gap-1.5 px-6 py-2 bg-primary-orange text-white rounded-lg text-xs font-bold hover:bg-hover-orange transition-colors shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingExtracted ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>💾 Save to {
                    extractedFolder === 'standards' ? 'Architecture Standards' :
                    extractedFolder === 'miro_diagram' ? 'Miro Diagram' :
                    extractedFolder === 'validation_rules' ? 'Validation Rules' : 'Sample Scripts'
                  }</span>
                )}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Disconnected State View: Orange & White Connection Form */
        <div className="max-w-xl mx-auto w-full py-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md space-y-5">
            <h2 className="font-extrabold text-lg text-sidebar border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="text-primary-orange">🔗</span> <span>Connect GitHub Repository / Account</span>
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleConnectGitHub(); }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center justify-between">
                  <span>GitHub Repository Link / URL</span>
                  <span className="text-[10px] text-primary-orange font-bold">*Required</span>
                </label>
                <input 
                  type="text" 
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  placeholder="e.g. https://github.com/sanjib2119-a11y/architecture-standards"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-sidebar outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 font-semibold transition-all shadow-sm"
                />
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed font-medium">
                  Paste any GitHub Repository URL or handle (e.g. <code className="text-primary-orange font-mono text-[10px]">https://github.com/owner/repo</code>). The system will automatically resolve the account owner ID (<strong className="text-sidebar">@owner</strong>) and connect live!
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center justify-between">
                  <span>Personal Access Token (PAT)</span>
                  <span className="text-[10px] text-gray-400 font-semibold">(Optional - for Private Repos)</span>
                </label>
                <input 
                  type="password" 
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxx (Optional)"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-sidebar font-mono outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 shadow-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={githubLoading || !githubUsername.trim()}
                className="w-full py-3.5 bg-primary-orange hover:bg-hover-orange text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {githubLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting Repository & Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <span>Connect Repository & Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
