// get the ninja-keys element
const ninja = document.querySelector("ninja-keys");

// add the home and posts menu items
ninja.data = [
  {
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },
  {
    id: "nav-research-agenda",
    title: "Research Agenda",
    description:
      "Research questions connecting contrastive learning, masked prediction, and predictive state through objectives, identifiable structure, limits, and design.",
    section: "Navigation",
    handler: () => {
      window.location.href = "/research-agenda/";
    },
  },
  {
    id: "nav-blog",
    title: "Blog",
    description: "",
    section: "Navigation",
    handler: () => {
      window.location.href = "/blog/";
    },
  },
  {
    id: "post-what-does-infonce-actually-do-to-representation-geometry",

    title: "What Does InfoNCE Actually Do to Representation Geometry?",

    description: "How InfoNCE shapes representation distributions through alignment potentials, entropic dispersion, and cross-modal coupling.",
    section: "Posts",
    handler: () => {
      window.location.href = "/blog/2026/what-does-infonce-do-to-representation-geometry/";
    },
  },
  {
    id: "post-the-coverage-lock-what-next-token-prediction-can-and-cannot-teach-multimodal-llms-about-the-visual-world",

    title: "The Coverage Lock: What Next-Token Prediction Can and Cannot Teach Multimodal LLMs About...",

    description: "On why next-token prediction can make multimodal systems useful without fully aligning language with the visual world.",
    section: "Posts",
    handler: () => {
      window.location.href = "/assets/essays/alignment_illusion.html";
    },
  },
  {
    id: "post-the-new-locus-of-representation-a-researcher-39-s-perspective-on-the-large-model-era-with-limited-compute",

    title: "The New Locus of Representation? A Researcher&#39;s Perspective on the Large-Model Era with...",

    description: "A short take on where representation learning lives in the era of large multimodal models and limited compute.",
    section: "Posts",
    handler: () => {
      window.location.href = "/assets/essays/the_new_locus_of_representation.html";
    },
  },
  {
    id: "post-the-shimmering-gap",

    title: "The Shimmering Gap",

    description: "Reflections on minds, intelligence, and knowing.",
    section: "Posts",
    handler: () => {
      window.location.href = "/assets/essays/monologue.html";
    },
  },
  {
    id: "post-when-the-internal-map-gets-warped-why-identifiable-representations-are-crucial-for-responsible-ai",

    title: "When the Internal Map Gets Warped: Why Identifiable Representations Are Crucial for Responsible...",

    description: "Why identifiable representations are crucial for responsible AI.",
    section: "Posts",
    handler: () => {
      window.location.href = "/assets/essays/identifiable_representation_learning.html";
    },
  },
  {
    id: "post-the-generalization-specialization-dilemma",

    title: "The Generalization-Specialization Dilemma",

    description: "On the tension between flexibility and precision in biological and artificial systems.",
    section: "Posts",
    handler: () => {
      window.location.href = "/blog/2025/the-generalization-specialization-dilemma/";
    },
  },
  {
    id: "post-language-and-the-art-of-modeling-the-world",

    title: "Language and the Art of Modeling the World",

    description: "Thoughts on the grounding of language, LLMs, and symbolic understanding.",
    section: "Posts",
    handler: () => {
      window.location.href = "/assets/essays/language_modeling_world.html";
    },
  },
  {
    id: "post-three-weekly-self-introspections",

    title: "Three Weekly Self-Introspections",

    description: "Personal routine reflections for better research alignment and weekly growth.",
    section: "Posts",
    handler: () => {
      window.location.href = "/assets/essays/weekly_self_introspections.html";
    },
  },
  {
    id: "post-how-information-bottleneck-helps-representation-learning",

    title: "How Information Bottleneck Helps Representation Learning",

    description: "An overview connecting rate-distortion theory, VIB, and beta-VAE under the information bottleneck lens.",
    section: "Posts",
    handler: () => {
      window.location.href = "/blog/2024/how-information-bottleneck-helps-representation-learning/";
    },
  },
  {
    id: "post-thoughts-on-contrastive-representation-learning",

    title: "Thoughts on Contrastive Representation Learning",

    description: "Reflections on disentanglement and causality in contrastive learning frameworks.",
    section: "Posts",
    handler: () => {
      window.location.href = "/blog/2024/thoughts-on-contrastive-representation-learning/";
    },
  },
  {
    id: "news-our-work-clap-isolating-content-from-style-through-contrastive-learning-with-augmented-prompts-was-accepted-at-eccv-2024",
    title: "Our work CLAP: Isolating Content from Style through Contrastive Learning with Augmented Prompts...",
    description: "",
    section: "News",
  },
  {
    id: "news-we-released-the-preprint-on-the-value-of-cross-modal-misalignment-in-multimodal-representation-learning",
    title: "We released the preprint On the Value of Cross-Modal Misalignment in Multimodal Representation...",
    description: "",
    section: "News",
  },
  {
    id: "news-our-work-on-the-value-of-cross-modal-misalignment-in-multimodal-representation-learning-was-selected-as-a-spotlight-at-neurips-2025",
    title: "Our work On the Value of Cross-Modal Misalignment in Multimodal Representation Learning was...",
    description: "",
    section: "News",
  },
  {
    id: "news-i-served-as-a-guest-lecturer-in-statistical-machine-learning-and-presented-recent-advances-in-vision-language-modeling",
    title: "I served as a guest lecturer in Statistical Machine Learning and presented recent...",
    description: "",
    section: "News",
  },
  {
    id: "news-check-out-our-new-preprint-the-geometric-mechanics-of-contrastive-representation-learning",
    title: "Check out our new preprint: The Geometric Mechanics of Contrastive Representation Learning.",
    description: "",
    section: "News",
  },
  {
    id: "news-i-attended-mlss-melbourne-2026-and-enjoyed-learning-from-world-class-speakers-and-connecting-with-the-community",
    title: "I attended MLSS Melbourne 2026 and enjoyed learning from world-class speakers and connecting...",
    description: "",
    section: "News",
  },
  {
    id: "news-we-had-3-papers-on-representation-learning-contrastive-learning-theory-ai4science-and-graphical-modeling-accepted-to-icml-2026",
    title: "We had 3 papers on representation learning (contrastive learning theory, AI4Science, and graphical...",
    description: "",
    section: "News",
  },
  {
    id: "news-new-essay-the-coverage-lock-why-scaling-cannot-teach-a-multimodal-model-what-its-training-questions-never-ask-about",
    title: "New essay: The Coverage Lock—why scaling cannot teach a multimodal model what its...",
    description: "",
    section: "News",
  },
  {
    id: "news-we-released-a-new-preprint-on-arxiv-on-the-identifiability-of-masked-prediction-mode-blindness-and-mask-schedules",
    title: "We released a new preprint on arXiv: On the Identifiability of Masked Prediction:...",
    description: "",
    section: "News",
  },
  {
    id: "social-email",
    title: "email",
    section: "Socials",
    handler: () => {
      window.open("mailto:%79%69%63%68%61%6F.%63%61%69@%61%64%65%6C%61%69%64%65.%65%64%75.%61%75", "_blank");
    },
  },
  {
    id: "social-scholar",
    title: "Google Scholar",
    section: "Socials",
    handler: () => {
      window.open("https://scholar.google.com/citations?user=nNp0nL4AAAAJ", "_blank");
    },
  },
  {
    id: "social-github",
    title: "GitHub",
    section: "Socials",
    handler: () => {
      window.open("https://github.com/YichaoCai1", "_blank");
    },
  },
  {
    id: "social-linkedin",
    title: "LinkedIn",
    section: "Socials",
    handler: () => {
      window.open("https://www.linkedin.com/in/yichao-cai-12a3b9292", "_blank");
    },
  },
  {
    id: "social-cv",
    title: "CV",
    section: "Socials",
    handler: () => {
      window.open("/assets/pdf/yichaocai_cv.pdf", "_blank");
    },
  },
  {
    id: "light-theme",
    title: "Change theme to light",
    description: "Change the theme of the site to Light",
    section: "Theme",
    handler: () => {
      setThemeSetting("light");
    },
  },
  {
    id: "dark-theme",
    title: "Change theme to dark",
    description: "Change the theme of the site to Dark",
    section: "Theme",
    handler: () => {
      setThemeSetting("dark");
    },
  },
  {
    id: "system-theme",
    title: "Use system default theme",
    description: "Change the theme of the site to System Default",
    section: "Theme",
    handler: () => {
      setThemeSetting("system");
    },
  },
];
