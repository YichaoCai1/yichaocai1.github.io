// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "publications by categories in reversed chronological order. generated by jekyll-scholar.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-repos",
          title: "repos",
          description: "Code repositories",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "post-the-generalization-specialization-dilemma",
      
        title: "The Generalization–Specialization Dilemma",
      
      description: "Some random thoughts about (artificial) intelligence.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/The-Generalization-Specialization-Dilemma/";
        
      },
    },{id: "post-language-and-the-art-of-modeling-the-world",
      
        title: "Language and the Art of Modeling the World",
      
      description: "Random thoughts on modeling.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/language-and-the-art-of-modeling-the-world/";
        
      },
    },{id: "post-three-weekly-self-introspections",
      
        title: "Three Weekly Self-Introspections",
      
      description: "To help maintain focus and progress in my research.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/self-introspections/";
        
      },
    },{id: "post-how-information-bottleneck-helps-representation-learning",
      
        title: "How Information Bottleneck Helps Representation Learning",
      
      description: "From the Rate Distortion Theory to β−VAE",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/information-bottleneck/";
        
      },
    },{id: "post-thoughts-on-contrastive-representation-learning",
      
        title: "Thoughts on Contrastive Representation Learning",
      
      description: "Reflections after reading papers on contrastive learning theory.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/contrastive-learning/";
        
      },
    },{id: "post-reading-report-of-causal-inference",
      
        title: "Reading Report of Causal Inference",
      
      description: "Some basic concepts in causality.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2021/causal-inference/";
        
      },
    },{id: "news-our-work-clap-isolating-content-from-style-through-contrastive-learning-with-augmented-prompts-is-accepted-to-appear-at-eccv-2024",
          title: 'Our work, CLAP: Isolating Content from Style through Contrastive Learning with Augmented Prompts,...',
          description: "",
          section: "News",},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project/";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
        id: 'social-discord',
        title: 'Discord',
        section: 'Socials',
        handler: () => {
          window.open("https://discord.com/users/", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%69%63%68%61%6F.%63%61%69@%61%64%65%6C%61%69%64%65.%65%64%75.%61%75", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/yichao-cai-12a3b9292", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0003-1607-8948", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=nNp0nL4AAAAJ", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/YichaoCai", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
