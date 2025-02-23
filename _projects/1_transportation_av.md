---
layout: page
title: Transportation & Self-Driving
description: Perception projects in transportation and autonomous driving.
img: assets/img/projects/autonomousdriving_cover.png
importance: 1
category: sci-tech
---

**Precise Curb Detection for Autonomous Sanitation Vehicles**

This project presents a novel framework for precise curb detection in autonomous sanitation vehicles, leveraging semantic segmentation with bird’s eye-view images for complex environments. Utilizing a lightweight HRNet for segmenting drivable areas and a zero-shot post-processing for curve fitting, alongside a modified RANSAC approach for outlier accommodation, the system demonstrates significant improvements in accuracy and robustness in challenging sanitation scenarios.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/curb.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Curb detection visualizations in various scenarios.
</div>

**Drivable Road Region Detection for Fixed-Route Autonomous Vehicles**

This project proposes a drivable road region detection approach for fixed-route autonomous vehicles using computer vision and neural networks. By fusing images with local route maps into a Map-Fusion Image (MFI) and applying the FCN-VGG16 neural network model, this method enhances detection accuracy, especially in complex areas like intersections and turns without lane markings, and achieves greater robustness compared to traditional non-fused image methods.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/autonomousdriving_cover.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Drivable road region detection based on a monocular camera.
</div>

**Video-Based Driving Simulation Software for Traffic Sign Evaluation**

A video driving simulation software has been developed for evaluating traffic signs. The process begins with the collection of video and vehicle movement data from actual driving scenarios. Subsequently, traffic signs within the collected footage are identified and tracked using image processing techniques. Newly designed traffic signs are then digitally inserted into the video, replacing their real-world counterparts. In the final step, vehicle movement data recorded during the drive is integrated into the video sequence, mirroring the motion experienced in the driving simulator. Participants interact with the simulation via the driving simulator's throttle and brake pedals, allowing them to navigate through the video sequence. This control over playback speed and simulated movement provides a driving visualization and experience closely resembling that of real-world conditions.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/drivingsimulation.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Driving simulator with real-world scenarios.
</div>

**Pedestrian Head Pose Estimation Using Surveillance Video**

This project contributes to human-vehicle interaction research in autonomous driving by analyzing pedestrian movement and head orientation through surveillance video of road crossings. It encompasses key vision tasks such as pedestrian and head detection, head pose estimation, multi-object tracking, and head position determination. Utilizing a novel dataset created from 10 participants with varying appearances, and employing advanced techniques like CNN-based classification and a combination of detection models with DeepSort, the project aims at improving the precision of pedestrian behavior analysis in autonomous driving contexts.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/headpose.png" title="cor" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Overall tasks of pedestrian head pose estimation.
</div>
