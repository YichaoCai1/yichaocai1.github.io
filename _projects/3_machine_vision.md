---
layout: page
title:  Machine Vision
description: Design and implementation of machine vision systems.
img: assets/img/projects/machinevision_cover.png
importance: 3
category:  # sci-tech
---

Distinct to computer vision applications, machine vision systems emphasize precision, robustness, and time efficiency, rather than generalization capabilities. In algorithm design for these systems, traditional pattern recognition methods are frequently utilized, with controlled illumination serving to mitigate algorithmic complexity. With recent advancements in model acceleration techniques, the incorporation of deep neural networks in the architecture of machine vision systems has gained prominence. Nevertheless, it is imperative to optimize the system's design to minimize indeterminacy and complexity in algorithms, ensuring the effective modeling of machine vision tasks. This approach is crucial for maintaining the high standards of accuracy and efficiency required in automated processes and industrial applications.

**Online Machine Vision System for Yarn Cone Defect Detection**

This project introduces an online machine vision system specifically designed for detecting surface defects in yarn cones. It incorporates two industrial cameras, LED strip lights, a photoelectric sensor, and a computer to capture and analyze images of yarn cones in real time. The system's innovative design, involving controlled illumination and specific camera settings, allows for detailed texture and profile imaging. By applying tailored algorithms for image analysis, the system efficiently identifies various defects, offering a solution that combines high accuracy with desirable operational speed for real-time industrial application.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/machinevision_cover.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    System design and software interface of the machine vision system.
</div>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/yarn_defect.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Tailored algorithms for yarn cone defect detection.
</div>


**Machine Vision System for Rail Welding Alignment Measurement**

This project introduces a machine vision system designed for assessing the alignment of rail welding. The system comprises a line laser and two industrial cameras, functioning under the structured light methodology with natural light excluded. During operation, it captures images from both top and side views. These images undergo a sequence of image processing steps, with the final assessment based on the analysis of fitting lines' distances.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/railalign.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Machine vision system for rail welding alignment measurement.
</div>