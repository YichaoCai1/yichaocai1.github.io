---
layout: post
title: Reading Report of Causal Inference
date: 2021-11-22 13:40:00
description: A reading report of "Elements of causal inference" by J. Peters et al.
tags: learning notes
categories: study
---

> "Correlation does not imply causation."

Given an input variable $X$, an outcome variable $Y$ and observations $ {(x_i, y_i)}$, probabilistic models can find a correlation between these variables $X$ and $Y$, as well as can give a prediction of $Y$ after observing $X = x$. One critical hypothesis of probabilistic models is observations ${(x_i, y_i)}$ are realizations of random variables ${(X_i, Y_i)}$ that are independently and identically distributed (i.i.d.) with joint distribution $P_{X,Y}$. However, such postulation can be violated and statistically observed correlations are not always reliable, thus we need to build a generic relationship between an effect and the cause that gives rise to it, namely causality.

**Structural causal model**
To this end, the structural causal model (SCM) is a methodology to well describe causality, which not only entails a joint distribution over all observables (like purely probabilistic descriptions), but also incorporates structural assignments about how $P_{X,Y}$ come about (directional relationships between variables) and the effect of interventions on variables. We can use an SCM modeling a system in an observational state and under perturbations at the same time. It is even possible to regard SCMs as models for counterfactual statements.

Before introducing SCMs, it is worth mentioning the principle of independent causal mechanisms (ICMs). To my understanding, it implies (1) one can intervene on one mechanism without affecting other mechanisms (" independence of mechanisms"), (2) the mechanism that generates the effect from its cause contains no information about the mechanism generating the cause (" independence of cause and mechanism") and (3) the noises of variables are independent (" independence of noises"). We shall see that SCMs submit to the assumptions in the remainder of this report.

Formally, an bivariate SCM with graph $C\rightarrow E$ consists of two assignments: 

\begin{equation}
\label{eq:bivar-SCM}
C:=N_C \tag 1 \\ E:=f_E(C, N_E), where~~ N_E \perp\!\!\!\perp N_C 
\end{equation}

