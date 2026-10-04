---
layout: essay
title: "What Does InfoNCE Actually Do to Representation Geometry?"
date: 2026-10-03
description: How InfoNCE shapes representation distributions through alignment potentials, entropic dispersion, and cross-modal coupling.
tags: representation-learning
author: Yichao Cai
read_time: 12
lang: en
essay: true
lang_zh_url: /zh/blog/
---

Our paper, **“The Geometric Mechanics of Contrastive Representation Learning: Alignment Potentials, Entropic Dispersion, and Cross-modal Divergence,”** was recently accepted to **ICML 2026**. Links to the paper and code are included at the end of this post.

In this work, we do not propose a new method or network architecture. Instead, we ask a more basic question:

> When we train a model with the InfoNCE loss, what is the contrastive objective actually doing in representation space?

If you are familiar with contrastive learning, this may sound like a question that already has a standard answer. The influential ICML 2020 paper by Wang and Isola introduced the now widely used view of contrastive learning in terms of **alignment** and **uniformity**: positive pairs should be close, while representations should remain well spread out. This perspective has become one of the standard ways to think about contrastive objectives.

But once we move from individual sample pairs to the distribution of representations as a whole, something interesting happens.

Consider multimodal contrastive learning with InfoNCE, as in CLIP-style vision-language models. Matched images and texts can have very high cosine similarity, and image-text retrieval can work extremely well. Yet the overall distributions of image and text representations may still occupy different regions of the embedding space. This is the phenomenon described by Liang et al. (NeurIPS 2022) as the **modality gap**.

So there is an apparent tension: if matched image-text pairs are already well aligned, why can the two representation distributions still remain separated?

There has been relatively little theory aimed directly at this question. That was the starting point of our work.

{% include figure.liquid
  path="assets/img/posts/infonce-geometric-mechanics/alignment-and-modality-gap.png"
  alt="Positive-pair alignment and separation between image and text representation distributions."
  width="1181"
  height="428"
  zoomable=true
  caption="Figure 1: Positive-pair alignment constrains local pairwise relationships, while the modality gap concerns the difference between the two representation distributions as a whole."
%}

## From individual embeddings to representation distributions

We usually think of an encoder as a function that maps one input at a time to a point in representation space. For example, an image encoder takes an image and returns a point on the unit sphere after L2 normalization. From this perspective, InfoNCE appears to mainly act on pairwise similarities between individual embeddings.

But over the data distribution, an encoder also induces a **distribution of representations**. The image encoder produces a distribution over image embeddings, the text encoder produces a distribution over text embeddings, and paired data determine a joint relationship between the two.

We therefore shift the object of analysis from a finite set of embedding vectors to probability measures over representation space. This lets us ask a different set of questions:

- What energy does InfoNCE induce on these representation distributions?
- What kinds of equilibrium distributions does it prefer?
- Is the geometry the same in unimodal and multimodal contrastive learning?

There is an important technical issue before we can answer these questions. In practice, training uses the stochastic InfoNCE loss computed on finite minibatches, while our theoretical analysis is based on a deterministic population objective. If the population objective only matches the minibatch objective in value, but gives different gradient directions, then it would not really explain the optimization dynamics used in practice.

We show that, in the large-batch limit, finite-batch InfoNCE converges to an explicit population energy not only in **objective value**, but also in its **parameter gradient**. This gives us the following chain of analysis:

> finite-batch stochastic InfoNCE → deterministic population energy → intrinsic geometry of representation distributions

This step is important because the rest of the theory is not based on an arbitrary surrogate chosen only for mathematical convenience. It describes the geometry that actual InfoNCE approaches in the large-batch limit.

{% include figure.liquid
  path="assets/img/posts/infonce-geometric-mechanics/population-geometry.png"
  alt="Analysis from finite-batch InfoNCE to population energy and representation geometry."
  width="917"
  height="175"
  zoomable=true
  caption="Figure 2: From a finite-batch stochastic objective to population-level representation geometry. Consistency in both value and gradient connects practical optimization to the intrinsic energy landscape."
%}

## Unimodal contrastive learning: alignment tells the distribution where to go, entropy controls how it spreads

Let us start with the more familiar unimodal setting. In our framework, the population objective takes the form of a free energy:

$$
\mathcal{F}_\tau(\rho)
=
\frac{1}{\tau}\int_{\mathcal Z} U(z)\rho(z)\,\mathrm d\mu(z)
+
\int_{\mathcal Z}\rho(z)\log\rho(z)\,\mathrm d\mu(z).
$$

Up to a scaling by temperature, this has the same form as the Helmholtz free energy from statistical physics.

Here, $$\rho$$ is the representation density, $$U(z)$$ is an alignment potential determined by the law of positive pairs, and $$\mathcal Z$$ is a complete Riemannian representation space. For intuition, you can simply think of $$\mathcal Z$$ as a hypersphere.

The first term can be understood as an **alignment energy**. Positive-pair relationships create an energy landscape that makes some regions of representation space more favorable than others.

The second term is negative entropy. It creates an **entropy-driven dispersion** effect: the representation distribution is encouraged not only to move toward low-energy regions, but also to avoid unnecessary concentration.

Together, these two effects produce a unique Gibbs equilibrium:

$$
\rho^*_{\tau,U}(z)
\propto
\exp\left(-\frac{U(z)}{\tau}\right).
$$

This gives a more concrete interpretation of the familiar idea of alignment and uniformity:

- the alignment potential determines which regions are preferred;
- temperature controls how strongly the distribution responds to energy differences;
- entropy controls how probability mass spreads within the regions allowed by the alignment structure.

Under this view, uniformity does **not** mean that representations must mechanically cover the entire sphere. A better interpretation is entropy-driven spreading under the constraints imposed by alignment.

If many geometric arrangements satisfy the positive-pair constraints, entropy decides how the representation mass is distributed among them. As the temperature becomes smaller, the Gibbs distribution concentrates more strongly around low-energy regions of the alignment potential.

So semantic clustering and representation diversity are not two unrelated empirical effects. They arise as competing terms in the same free-energy objective.

{% include figure.liquid
  path="assets/img/posts/infonce-geometric-mechanics/gibbs-equilibrium.png"
  alt="Alignment potential and entropy shaping a unimodal Gibbs equilibrium."
  width="1440"
  height="713"
  zoomable=true
  caption="Figure 3: Gibbs geometry for unimodal InfoNCE. The alignment potential selects low-energy regions, while entropy controls how broadly representations spread within them."
%}

## Symmetric InfoNCE is not geometrically symmetric in the way we might expect

The more surprising part of the story appears in multimodal contrastive learning.

In CLIP-style training, the usual objective averages two directional losses: image-to-text and text-to-image. Because the formula is symmetric, this is commonly called **symmetric InfoNCE**. It is tempting to think of it as simply adding together two unimodal-style objectives: images retrieve texts, and texts retrieve images.

But at the level of representation distributions, the two modalities are not independent. They are **cross-coupled**.

The reason is that the two modalities can have different data distributions, and each modality appears in the other direction as the reference distribution that forms the negatives in the softmax denominator.

In our derivation, the multimodal population energy contains a persistent negative symmetrized divergence term:

$$
\frac{1}{2}
\Bigl[
\mathcal F_{1\to2}(\rho_1)
+
\mathcal F_{2\to1}(\rho_2)
\Bigr]
-
\frac{1}{2}
\Bigl[
D_{\mathrm{KL}}(\rho_1\Vert\rho_2)
+
D_{\mathrm{KL}}(\rho_2\Vert\rho_1)
\Bigr].
$$

Here, $$1\to2$$ denotes the contrastive direction from modality 1 to modality 2, and vice versa.

The negative sign in front of the divergence does **not** mean that the two distributions must always move infinitely far apart. What it tells us is more subtle: exact overlap of the two marginal distributions is not automatically preferred by the objective.

When the modalities are conditionally heterogeneous, this cross-coupling can create a barrier-like geometry. Each modality effectively reshapes the potential seen by the other. In the paper, we write the effective potential for modality 1 given modality 2 as

$$
V_{1\mid2}(z)
=
\frac{1}{\tau}U_{1\to2}(z)
+
\log\rho_2(z).
$$

If we hold the text distribution fixed, the image modality sees an effective potential containing the log density of the text representations. Roughly speaking, regions where the other modality already has high density can become more costly for the current modality. The same happens in the reverse direction.

The two representation distributions therefore do not optimize their geometry independently. Instead, they evolve as a coupled best-response system.

This gives a population-level explanation for why the following two facts can hold at the same time:

1. matched image-text pairs have high similarity;
2. the marginal image and text representation distributions still remain noticeably separated.

The key point is that **pairwise alignment and distributional alignment are not the same constraint**.

Pairwise alignment asks whether a particular image is close to its matched text. Distributional alignment asks whether the full image and text representation populations follow similar distributions. Satisfying the first condition does not automatically satisfy the second.

{% include figure.liquid
  path="assets/img/posts/infonce-geometric-mechanics/multimodal-cross-coupling.png"
  alt="Cross-coupled image and text distributions under symmetric InfoNCE."
  width="1440"
  height="740"
  zoomable=true
  caption="Figure 4: Symmetric multimodal InfoNCE combines pairwise attraction with distribution-level cross-coupling. Strong positive-pair alignment can therefore coexist with separation between the two marginal distributions."
%}

## Does this mean the modality gap is always harmful?

No.

Our conclusion is not that InfoNCE necessarily creates a modality gap, nor that the existence of a modality gap means the model has failed to train properly.

What we provide is a **geometric explanation at the objective level**: a modality gap need not be only an accident caused by finite batches, incomplete optimization, or limited model capacity. Under some conditions, it can also be compatible with, or maintained by, the population geometry of symmetric InfoNCE itself.

Whether such a gap is harmful depends on the downstream task.

Cross-modal retrieval mainly depends on the relative geometry of matched and mismatched pairs. A model can therefore have excellent retrieval performance even when the image and text marginals are visibly separated.

On the other hand, if a downstream application requires cross-modal calibration, a shared decision boundary, or representations that are directly interchangeable across modalities, then positive-pair alignment alone may not be enough.

This leads to a simple practical message:

> **If an application really requires the marginal representation distributions of two modalities to match, that property should be measured directly and, when necessary, controlled explicitly. It should not be assumed to follow automatically from the pairwise contrastive loss.**

## What do the experiments show?

Our theory describes the population objective and the geometry that appears in the large-batch limit. To see whether this mechanism is relevant to real models, we also run controlled synthetic experiments and analyze OpenCLIP representations on MS-COCO.

One simple observation is that different pretrained checkpoints can achieve very similar retrieval performance while exhibiting substantially different modality gaps.

We also perform controlled caption-corruption experiments. As we weaken the instance-level correspondence between images and captions, retrieval performance degrades, while the measured modality gap increases systematically.

These results suggest that retrieval quality and modality gap are related, but they are not the same quantity. A single retrieval score does not fully describe the geometric state of a multimodal representation system.

There is also an important limitation to keep in mind. Our experiments do not show that a finite-batch model with a particular architecture and optimizer must converge exactly to the theoretical equilibrium. A better interpretation is that the population-level mechanism identified by the theory leaves measurable geometric signatures in practical models.

<figure class="figure-pair" id="figure-5">
  <div class="figure-pair-images">
    <a href="{{ '/assets/img/posts/infonce-geometric-mechanics/retrieval-and-gap.png' | relative_url }}" aria-label="Open retrieval performance plot at full size">
      <img src="{{ '/assets/img/posts/infonce-geometric-mechanics/retrieval-and-gap.png' | relative_url }}" alt="Retrieval performance and modality gap across pretrained checkpoints." width="665" height="472" loading="lazy" data-zoomable>
    </a>
    <a href="{{ '/assets/img/posts/infonce-geometric-mechanics/caption-corruption.png' | relative_url }}" aria-label="Open caption corruption plot at full size">
      <img src="{{ '/assets/img/posts/infonce-geometric-mechanics/caption-corruption.png' | relative_url }}" alt="Retrieval performance and modality gap under caption corruption." width="646" height="462" loading="lazy" data-zoomable>
    </a>
  </div>
  <figcaption>Figure 5: Retrieval performance and modality gap are related, but not equivalent. Similar retrieval performance can correspond to different distribution-level geometries.</figcaption>
</figure>

## What does the objective actually ask the model to learn?

This work is part of a broader question I have been increasingly interested in: **what properties of a representation are actually identified by the learning objective?**

A model can perform its training task extremely well while leaving other aspects of its internal representation largely unconstrained. Those unconstrained properties may then vary with architecture, initialization, optimization, or data details, without noticeably affecting the training loss.

Contrastive learning gives a clean example. InfoNCE strongly constrains the relative geometry of positive and negative samples, but this does not mean that every global property of the resulting representation distribution is also fixed. In the multimodal setting, good pairwise alignment therefore does not imply that the two marginal distributions must coincide.

I think this distinction matters increasingly as we scale models and make stronger claims about what their representations contain. Better performance alone cannot tell us whether a desired latent structure is uniquely determined by the objective, merely compatible with it, or not constrained at all.

So beyond asking whether a learning objective works, it is worth asking a second question:

> **Does the supervision actually measure and constrain the representation property we care about?**

If it does not, then failure to recover that property need not mean that the model is too small, the optimizer is poor, or training has not gone far enough. The objective may simply never have required it.

From this perspective, the geometry of InfoNCE is one instance of a more general problem: understanding what learning objectives make identifiable, what they leave ambiguous, and what additional supervision is needed to resolve that ambiguity.

---

**Paper:** [The Geometric Mechanics of Contrastive Representation Learning](https://arxiv.org/abs/2601.19597)

**Conference:** International Conference on Machine Learning (ICML 2026)

**Authors:** Yichao Cai, Zhen Zhang, Yuhang Liu, Javen Qinfeng Shi

**Code:** [InfoNCE_Geometry on GitHub](https://github.com/YichaoCai1/InfoNCE_Geometry)

I am always happy to discuss representation learning theory, identifiability, and representation geometry with people working on related questions.
