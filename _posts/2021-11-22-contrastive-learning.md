---
layout: post
title: Thoughts on Contrastive Representation Learning
date: 2024-01-16 19:31:00
description: Reflections after reading papers on contrastive learning theory.
tags: study
categories: thoughts
---

> This passage initiates by addressing the question depicted in Fig.1. Despite reviewing the referenced papers [1-6], I acknowledge lingering uncertainties regarding the nuances of contrastive representation learning. Therefore, I draft this for later review and reflections.
<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/posts/image1.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
<div class="caption">
    Figure 1. Are these two samples (either in text-modality and image-modality) are appropriate to be considered a positive pair as the learning objective for disentangling the true content variable? (Images generated with SDv2.1)
</div>


**Reference**

[1] Daunhawer, I., Bizeul, A., Palumbo, E., Marx, A., and Vogt, J. E. (2022). Identifiability results for multimodal contrastive learning. In The Eleventh International Conference on Learning Representations.

[2] Eastwood, C., von K ̈ugelgen, J., Ericsson, L., Bouchacourt, D., Vincent, P., Ibrahim, M., and Sch ̈olkopf, B. (2023). Self-supervised disentanglement by leveraging structure in data augmentations. In Causal Representation Learning Workshop at NeurIPS 2023.

[3] Von K ̈ugelgen, J., Sharma, Y., Gresele, L., Brendel, W., Sch ̈olkopf, B., Besserve, M., and Locatello, F. (2021). Self-supervised learning with data augmentations provably isolates content from style. Advances in neural information processing systems, 34:16451–16467.

[4] Wang, T. and Isola, P. (2020). Understanding contrastive representation learning through alignment and uniformity on the hypersphere. In International Conference on Machine Learning, pages 9929–9939. PMLR.

[5] Xiao, T., Wang, X., Efros, A. A., and Darrell, T. (2020). What should not be contrastive in contrastive learning. In International Conference on Learning Representations.

[6] Zimmermann, R. S., Sharma, Y., Schneider, S., Bethge, M., and Brendel, W. (2021). Contrastive learning inverts the data generating process. In International Conference on Machine Learning, pages 12979 12990. PMLR.
