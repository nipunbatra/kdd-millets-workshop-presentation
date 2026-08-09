---
marp: true
theme: kdd-millets-strong
paginate: true
size: 16:9
html: true
title: Feature-Informed Self-Supervised Learning for Time Series Understanding
description: KDD MILETS 2026 workshop presentation
footer: KDD MILETS 2026 · Feature-informed SSL
---

<!-- _class: title-slide -->
<!-- _paginate: false -->
<!-- _footer: '' -->

<div class="title-copy">
  <div class="title-brand-row">
    <img class="title-lab-logo" src="assets/sustainability-lab-logo-cropped.svg" alt="Sustainability Lab">
    <img class="title-kdd-logo" src="assets/image1.png" alt="KDD 2026">
  </div>
  <div class="kicker">KDD MILETS WORKSHOP · 2026</div>

# Feature-informed self-supervised learning for time-series understanding

  <div class="title-subtitle">Predicting engineered signal descriptors from unlabeled windows</div>
  <div class="title-meta">
    <div class="title-authors">Parv Thacker · Ayush Shrivastava · Nipun Batra</div>
    <div class="title-affiliation">Indian Institute of Technology Gandhinagar</div>
  </div>
</div>

<div class="title-hero">
  <img class="title-device" src="assets/e4-render-front-lg.png" alt="Empatica E4 wearable sensor">
  <img class="title-wave" src="assets/ppg-title-strip.svg" alt="Authentic PPG-DaLiA pulse waveform">
</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 1, title and author list; p. 7, §8 Conclusion.
- Real signal: PPG-DaLiA Subject 1, samples 73,120–73,375, 2018-06-29 09:22:57–09:23:04.968750, 32 Hz, from the Edge Impulse CSV subset of the UCI PPG-DaLiA dataset (UCI DOI: 10.24432/C53890; subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation). The strip is an editable SVG derived from those samples without synthetic interpolation.
- Device render: Empatica E4 official product page, https://www.empatica.com/research/e4/ .
- Sustainability Lab signature follows the user's `air-quality-talk` / `ccai` Marp visual language; the SVG viewBox was cropped to remove blank margins.
- KDD 2026 mark is from the supplied student deck.
-->

---

<div class="kicker">Motivation · acquisition</div>

## Unlabeled windows are easier to acquire than task supervision

<div class="body top">
  <div class="evidence-lanes">
    <div class="evidence-lane">
      <div class="lane-head"><span class="lane-name">PPG-DaLiA</span><span class="lane-task">heart-rate regression</span></div>
      <div class="real-plot-frame acquisition-frame ppg-acquisition">
        <img class="acquisition-photo" src="assets/acquisition-optical-wrist-sensor-imagegen-v1.png" alt="Generated acquisition context: a generic optical wrist sensor">
        <div class="acquisition-data-card">
          <div class="acquisition-data-head"><span>AUTHENTIC 8 S WRIST PPG</span><span>32 Hz · REFERENCE HR 100.35 BPM</span></div>
          <img class="acquisition-ppg-trace" src="assets/ppg-title-strip.svg" alt="Authentic eight-second PPG-DaLiA wrist PPG window">
        </div>
      </div>
      <div class="lane-copy"><b>Continuous wrist PPG</b>Reference heart rate still needs synchronized ECG.</div>
    </div>
    <div class="evidence-lane hhar">
      <div class="lane-head"><span class="lane-name">HHAR</span><span class="lane-task">activity recognition</span></div>
      <div class="real-plot-frame acquisition-frame hhar-acquisition">
        <img class="acquisition-photo" src="assets/acquisition-smartwatch-walking-imagegen-v1.png" alt="Generated acquisition context: a generic smartwatch during walking">
        <div class="acquisition-data-card">
          <div class="acquisition-data-head"><span>AUTHENTIC 5 S ACCELERATION</span><span>USER A · GEAR_1</span></div>
          <div class="hhar-mini-row"><span>STANDING</span><div class="hhar-mini-crop standing"><img src="assets/hhar-standing-walking.svg" alt="Authentic HHAR standing accelerometer-magnitude window"></div></div>
          <div class="hhar-mini-row"><span>WALKING</span><div class="hhar-mini-crop walking"><img src="assets/hhar-standing-walking.svg" alt="Authentic HHAR walking accelerometer-magnitude window"></div></div>
        </div>
      </div>
      <div class="lane-copy"><b>Continuous inertial sensing</b>Activity labels still need an executed protocol.</div>
    </div>
  </div>
</div>

<div class="source">Generated acquisition context; signal overlays are authentic PPG-DaLiA and HHAR records.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 3, §3.4, evaluated datasets and downstream tasks.
- PPG overlay: PPG-DaLiA Subject 1, samples 73,120–73,375, 2018-06-29 09:22:57–09:23:04.968750, 32 Hz, median ECG-derived reference HR 100.35 BPM, from the Edge Impulse CSV subset of the UCI PPG-DaLiA dataset (UCI DOI: 10.24432/C53890; subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation). Reference-heart-rate provenance follows Reiss et al., Sensors 2019, DOI 10.3390/s19143079.
- HHAR windows: UCI Heterogeneity Activity Recognition dataset, DOI 10.24432/C5689X, CC BY 4.0; `Watch_accelerometer.csv`, user a, model gear, device gear_1; stand Index 2980–3482 and walk Index 13306–13808.
- Acquisition-context images were generated with OpenAI ImageGen on 2026-08-09. They are conceptual only and do not depict PPG-DaLiA or HHAR participants, study devices, or acquisition sessions. Exact prompts are recorded in `provenance/imagegen-acquisition-prompts.txt`.
- Claim scope: this slide motivates why self-supervision is useful; it does not assert a particular unlabeled:labeled ratio for either benchmark.
-->

---

<div class="kicker">Analogy · computer vision</div>

## For object identity, selected image transforms can preserve the learning target

<div class="body top vision-layout">
  <div class="vision-original">
    <img src="assets/cat-cc0.jpg" alt="Juvenile orange tabby cat">
    <div class="image-tag">one photographed instance</div>
  </div>
  <div class="vision-views">
    <div class="view-card"><div class="photo flip"><img src="assets/cat-cc0.jpg" alt="Horizontally flipped cat"></div><div class="label">horizontal flip</div></div>
    <div class="view-card"><div class="photo crop"><img src="assets/cat-cc0.jpg" alt="Cropped cat"></div><div class="label">crop</div></div>
    <div class="view-card"><div class="photo color"><img src="assets/cat-cc0.jpg" alt="Color-distorted cat"></div><div class="label">colour distortion</div></div>
    <div class="view-card claim"><strong>Why it works:</strong> for an object-identity task, the positive views can still depict the same cat.</div>
  </div>
</div>

<div class="source">CC0 photograph; every view is generated deterministically from the same pixels.</div>

<!--
[Sources]
- Concept adapted from supplied student deck, slides 3–7.
- Cat photograph: Playing096, “Juvenile orange tabby cat,” Wikimedia Commons, CC0, https://commons.wikimedia.org/wiki/File:Juvenile_orange_tabby_cat.jpg .
- Crop, flip, and colour transformation were produced in CSS from the same source photograph; no generated image is used.
- Scientific qualification: transformation validity depends on the learning target. This slide concerns object identity, not every vision task.
-->

---
<!-- _class: invariance-failure -->

<div class="kicker">Failure mode · task-mismatched invariance</div>

## When a transformation changes signal semantics, invariance suppresses target-relevant structure

<div class="invariance-layout">
  <div class="invariance-visual">
    <div class="conceptual-label">conceptual illustration · authentic PPG example follows</div>
    <img src="assets/paired-view-invariance-failure-imagegen-v1.png" alt="Conceptual contrast between a transformed visual object and a transformed physiological time series">
    <div class="invariance-captions"><span>visual views: object identity can persist</span><span>signal views: temporal meaning can change</span></div>
  </div>
  <div class="invariance-logic">
    <div class="logic-step">
      <div class="logic-label">paired-view objective</div>
      <div class="logic-equation">z(x) ≈ z(T(x))</div>
      <p>Encourages reduced sensitivity to view-specific differences.</p>
    </div>
    <div class="logic-step">
      <div class="logic-label">required assumption</div>
      <div class="logic-equation">y(x) = y(T(x))</div>
      <p>Requires the transformation to preserve the task target.</p>
    </div>
    <div class="logic-step failure">
      <div class="logic-label">when the assumption fails</div>
      <div class="logic-equation">y(x) ≠ y(T(x))</div>
      <p>Target-relevant evidence can be attenuated.</p>
    </div>
  </div>
</div>

<div class="invariance-consequence"><b>For time series, that discarded difference can be the target:</b> temporal order · event presence · amplitude · local morphology</div>

<div class="source">Conceptual ImageGen illustration; the next slide applies exact transformations to an authentic PPG-DaLiA window.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 1, Abstract and Introduction: paired-view methods train representations of transformed views to remain similar; time-series transformations can alter order, continuity, amplitude, frequency structure, or physical coherence.
- Concept and comparison adapted from the supplied student deck, slides 7–10. The original untraceable MESA screenshot is not reused.
- Notation is explanatory: z denotes the learned representation, T the augmentation, and y the downstream target. The validity condition y(x)=y(T(x)) states the task-specific invariance required by the paired-view objective.
- The conceptual illustration was generated with OpenAI ImageGen on 2026-08-09. It is not a dataset record or empirical result; the exact prompt is recorded in `provenance/imagegen-invariance-prompt.txt`.
- Scientific boundary: the paper motivates this failure mode but does not directly test whether each augmentation changes a downstream label. The claim is conditional, not universal.
-->

---

<!-- _class: downstream-augmentation -->

<div class="kicker">Design test · task-specific invariance</div>

## A transform is valid only if it preserves downstream evidence

<div class="body top">
  <img class="real-augmentation" src="assets/augmentation-real-ppg.svg" alt="Authentic PPG-DaLiA window under reversal, masking, and scaling plus jitter">
  <div class="application-strip">
    <div class="application-item">
      <b>PPG-DaLiA · heart-rate regression</b>
      <strong>Preserve beat interval and dominant frequency</strong>
      <span>Reject T if beat timing or dominant-rate evidence becomes unreliable.</span>
    </div>
    <div class="application-item">
      <b>HHAR · activity recognition</b>
      <strong>Preserve amplitude, periodicity and transitions</strong>
      <span>Reject T if cadence, intensity or a transition needed for classification is distorted.</span>
    </div>
    <div class="application-item">
      <b>Illustrative extension · event / anomaly detection</b>
      <strong>Preserve transient presence, duration and order</strong>
      <span>Reject T if it masks, truncates or reorders the candidate event.</span>
    </div>
  </div>
  <div class="augmentation-rule"><b>Decision rule</b><span>Admit T as a positive-pair transform only when <i>y(x) = y(T(x))</i> and the evidence required for y remains physically plausible.</span></div>
</div>

<div class="source">Authentic PPG-DaLiA example. Heart-rate and activity tasks are evaluated in this study; event detection is an illustrative extension.</div>

<!--
[Sources]
- Supplied manuscript, p. 1, Abstract and §1, motivation concerning jitter, scaling, masking, reversal, and task-mismatched invariance.
- Supplied manuscript, p. 3, §3.4: the evaluated downstream tasks are heart-rate regression on PPG-DaLiA and activity recognition on HHAR.
- Real signal: PPG-DaLiA Subject 1, samples 73,120–73,375, 8 s at 32 Hz, UCI DOI 10.24432/C53890; Edge Impulse subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation .
- Exact operations: x̃(t) denotes the linearly detrended, within-window-scaled display signal; reverse sample order; zero samples 96–135 (3.00 ≤ t < 4.25 s); and 1.25 x̃(t) + 0.15 sin(2π·6t). All panels use the same 0–8 s and −3.25–3.25 axes.
- The downstream preservation test is explanatory and conditional: heart-rate regression requires recoverable rate/timing evidence; activity recognition can depend on amplitude, periodicity, and temporal transitions; event/anomaly detection is included only as an illustrative downstream extension and was not evaluated in the paper.
- The paper motivates, but does not directly test, semantic loss caused by these operations. No claim is made that every transformed window changes its downstream label.
-->

---

<!-- _class: concept-bridge feature-family-slide -->
<div class="kicker">Approach intuition · feature targets</div>

## Each window supplies statistical, temporal, and spectral targets

<div class="family-overview">
  <img src="assets/ppg-descriptor-views.svg" alt="One authentic PPG window viewed through statistical, temporal, and spectral descriptors">
</div>

<div class="family-method-note"><b>Target construction</b><span>select equal counts across families → compute per channel → concatenate → standardize over the pretraining dataset</span></div>

<div class="source">One authentic PPG-DaLiA window; derived views illustrate what the descriptor families measure, not individual feature importance.</div>

<!--
[Sources]
- Supplied workshop manuscript, pp. 2–3, §3.1–3.2: TSFEL targets span statistical, temporal, and spectral domains; examples named by the manuscript are mean, variance, and skewness; zero-crossing rate, autocorrelation, and temporal entropy; and spectral centroid, dominant frequency, and spectral entropy.
- The manuscript applies the feature extractor independently to each channel, concatenates the per-channel descriptors, selects equal numbers from the three domains for the 15/30/45/90-feature variants, and standardizes targets at dataset level before MSE regression.
- Real signal: PPG-DaLiA Subject 1, samples 73,120–73,375, 8 s at 32 Hz, UCI DOI 10.24432/C53890; subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation .
- Derived values in the graphic: standard deviation 59.9 a.u.; IQR 99.2; autocorrelation peak at 0.594 s; 27 centered zero crossings; periodogram peak 1.672 Hz (approximately 100.3 cycles/min). Processing and provenance are documented in `provenance/ppg-intuition-assets.md`.
- Interpretive boundary: the listed descriptors are manuscript examples of each family. The study does not ablate individual descriptors or establish which feature is causally responsible for downstream performance.
-->

---

<div class="kicker">Feature intuition · activity</div>

## Statistical and temporal descriptors expose differences between activity windows

<div class="body top">
  <img class="feature-asset" src="assets/hhar-feature-intuition.svg" alt="Authentic HHAR standing and walking windows with variance, zero crossings, and autocorrelation">
  <div class="feature-footer"><span><b>Variance</b> · amplitude spread</span><span><b>Mean-band crossings</b> · thresholded transitions</span><span><b>Autocorrelation</b> · repeated temporal structure</span></div>
</div>

<div class="source">Matched real HHAR windows from one user, device, and sensor; descriptors summarize structure, not feature importance.</div>

<!--
[Sources]
- UCI Heterogeneity Activity Recognition dataset, DOI 10.24432/C5689X, CC BY 4.0; `Watch_accelerometer.csv`, user a, model gear, device gear_1; stand Index 2980–3482 and walk Index 13306–13808; 503 samples per window.
- Values shown: magnitude variance 0.00845 vs 9.859; ±0.25-deadband centered crossings 2 vs 20; autocorrelation maxima r=0.154 at 0.668 s vs r=0.751 at 1.026 s. Full selection rule and preprocessing: `provenance/hhar-authentic-pair-manifest.txt`.
- Descriptor-family motivation: supplied manuscript, pp. 2–3, §3.2.
- Interpretive boundary: the visualization explains what the descriptors measure; the paper does not ablate individual descriptors or establish that these three alone classify HHAR.
-->

---

<div class="kicker">Feature intuition · heart rate</div>

## Spectral descriptors make periodic rate information explicit

<div class="body top">
  <img class="feature-asset" src="assets/ppg-hr-waveform-spectrum.svg" alt="Two authentic PPG-DaLiA windows with different ECG-derived reference heart rates and their spectra">
  <div class="feature-footer"><span><b>Dominant frequency</b> · strongest periodic component</span><span><b>f<sub>peak</sub> × 60</b> · cycles per minute</span><span>selected real windows · explanatory comparison</span></div>
</div>

<div class="source">PPG-DaLiA Subject 1: 51.58 and 100.35 BPM reference windows; spectra derived from the observed wrist PPG.</div>

<!--
[Sources]
- PPG-DaLiA Subject 1 windows from the Edge Impulse CSV subset of the UCI dataset, DOI 10.24432/C53890; 32 Hz; subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation .
- Lower-rate window: samples 20,832–21,087, 2018-06-29 08:55:43–08:55:50.968750, median reference HR 51.58 BPM; periodogram peak 0.859375 Hz = 51.5625 BPM.
- Higher-rate window: samples 73,120–73,375, 2018-06-29 09:22:57–09:23:04.968750, median reference HR 100.35 BPM; periodogram peak 1.671875 Hz = 100.3125 BPM.
- Processing: linear detrending; Hann window; 2,048-point zero-padded one-sided FFT; normalized within 0.5–3.2 Hz. This is an explanatory periodogram, not a claim about the exact implementation of every TSFEL spectral descriptor.
- The windows were selected deliberately for pedagogical agreement and are not a representative error analysis; the paper does not isolate spectral-feature causality.
-->

---

<div class="kicker">Approach · two-path pretraining</div>

## Pretraining predicts standardized TSFEL descriptors

<div class="body top">
  <img class="method-asset" src="assets/feature-ssl-method-real.svg" alt="Feature-informed SSL with fixed TSFEL target path, learned encoder and predictor, MSE loss, and downstream transfer">
  <div class="takeaway">The method removes view construction—not inductive bias. Descriptor choice defines what the encoder is asked to retain.</div>
</div>

<div class="source">Source: supplied manuscript, §3.1–3.2 and Eqs. 1–3. Fixed target branch and learned prediction branch meet only at the loss.</div>

<!--
[Sources]
- Supplied workshop manuscript, pp. 2–3, §3.1–3.2 and Eqs. 1–3.
- Diagram structure was informed by supplied student deck slide 16, then rebuilt as an editable SVG.
- Small input trace: PPG-DaLiA Subject 1, samples 73,120–73,375 at 32 Hz, from the Edge Impulse subset of the UCI dataset, DOI 10.24432/C53890; subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation .
- The TSFEL extractor is fixed and its targets may be computed once; encoder E and predictor P are learned during pretraining; P is discarded for downstream transfer.
-->

---

<div class="kicker">Evidence · evaluated tasks</div>

## The study evaluates two wearable-sensing tasks

<div class="body top dataset-grid">
  <div class="dataset-card">
    <div class="dataset-head"><h3>PPG-DaLiA</h3><span>regression · MAE ↓</span></div>
    <div class="dataset-visual ppg"><img class="device" src="assets/e4-render-front-lg.png" alt="Empatica E4"><img src="assets/ppg-title-strip.svg" alt="PPG-DaLiA wrist PPG strip"></div>
    <div class="dataset-metrics"><div class="dataset-metric"><b>15</b><span>participants</span></div><div class="dataset-metric"><b>PPG + ACC</b><span>channels retained</span></div><div class="dataset-metric"><b>HR</b><span>continuous target</span></div></div>
  </div>
  <div class="dataset-card hhar">
    <div class="dataset-head"><h3>HHAR</h3><span>classification · macro F1 ↑</span></div>
    <div class="dataset-visual"><img src="assets/hhar-standing-walking.svg" alt="Authentic HHAR accelerometer windows"></div>
    <div class="dataset-metrics"><div class="dataset-metric"><b>9</b><span>users</span></div><div class="dataset-metric"><b>ACC + GYR</b><span>sensor modalities</span></div><div class="dataset-metric"><b>6</b><span>activity classes</span></div></div>
  </div>
</div>

<div class="source">Sources: supplied manuscript §3.4; PPG-DaLiA and HHAR official dataset records.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 3, §3.4.
- PPG-DaLiA: Reiss et al. 2019, DOI 10.3390/s19143079; UCI DOI 10.24432/C53890. The study retained PPG and accelerometer channels for heart-rate regression.
- HHAR: Stisen et al. 2015 / UCI DOI 10.24432/C5689X; smartphone and smartwatch accelerometer/gyroscope recordings from 9 users and six activities. Displayed windows: `Watch_accelerometer.csv`, user a, model gear, device gear_1; stand Index 2980–3482 and walk Index 13306–13808.
- Empatica E4 render: official Empatica product page, https://www.empatica.com/research/e4/ .
- Signal strips are authentic dataset samples with provenance recorded in `provenance/ppg-intuition-assets.md` and `provenance/hhar-authentic-pair-manifest.txt`.
-->

---

<div class="kicker">Evaluation · matched comparisons</div>

## The comparison spans 1,600 runs across matched settings

<div class="body top">
  <div class="eval-equation">
    <div><div class="n">2</div><span class="lab">datasets</span></div><div class="times">×</div>
    <div><div class="n">4</div><span class="lab">backbones</span></div><div class="times">×</div>
    <div><div class="n methods">10</div><span class="lab">methods</span></div><div class="times">×</div>
    <div><div class="n">20</div><span class="lab">configurations</span></div>
  </div>
  <div class="eval-total">= 1,600 training runs</div>
  <div class="rank-flow">
    <div class="rank-step"><div class="no">01 · MATCH</div><h3>Hold the setting fixed</h3><p>Dataset, backbone, transfer regime, label fraction, and hyperparameters.</p></div>
    <div class="rank-arrow">→</div>
    <div class="rank-step"><div class="no">02 · RANK</div><h3>Order the ten methods</h3><p>Macro F1 for HHAR; MAE for PPG-DaLiA.</p></div>
    <div class="rank-arrow">→</div>
    <div class="rank-step"><div class="no">03 · AGGREGATE</div><h3>Average within task</h3><p>80 matched settings per method and dataset; lower mean rank is better.</p></div>
  </div>
  <div class="eval-note"><span>20 configurations = 12 learning-rate robustness + 4 label-scarcity + 4 head/pooling</span><span>160 runs per method across both tasks</span></div>
</div>

<div class="source">Source: supplied manuscript, Table 1 and §3.3–3.5.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 3, Table 1; pp. 3–4, §3.3–3.5.
- Arithmetic: 2 datasets × 4 backbones × 10 methods × 20 grouped configurations = 1,600 runs.
- Each method contributes 160 runs overall and 80 per dataset. Task-specific mean ranks in Tables 2–3 therefore aggregate 80 matched settings per method.
- The 20 settings are 12 + 4 + 4 grouped studies, not a full factorial design.
-->

---

<div class="kicker">Main result · heart-rate regression</div>

## PPG-DaLiA: TSFEL15 has the lowest mean rank

<div class="body top result-split">
  <img class="result-figure" src="assets/ppg-rank-distribution.svg" alt="PPG-DaLiA rank distributions across ten methods">
  <div class="result-callout">
    <div class="eyebrow">mean rank ↓</div><div class="value">3.95</div><div class="detail"><strong>TSFEL15</strong> has the lowest mean rank over 80 matched PPG-DaLiA settings.</div>
    <div class="divider"></div>
    <div class="eyebrow">observed mean MAE ↓</div><div class="comparison"><strong>TSFEL30 · 11.58 BPM</strong><br>Barlow · 11.59 BPM<br><span class="note">No significance test is reported for the 0.01 BPM difference.</span></div>
  </div>
</div>

<div class="source">Source: supplied manuscript, Figure 1a, Table 2, and §4.1. Lower rank and lower MAE are better.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 4, Table 2 and §4.1; p. 6, Figure 1a.
- Exact aggregate values: TSFEL15 mean rank 3.95; TSFEL30 mean MAE 11.58 BPM; Barlow mean MAE 11.59 BPM.
- Rank-distribution whisker/IQR/median geometry was reconstructed from the supplied paper figure. Its stale dashed mean marker was replaced with the exact final-manuscript mean rank from Table 2; the filled dot and right-column value are canonical.
- No confidence interval or inferential test is reported for the 0.01 BPM difference; the slide presents observed means only.
-->

---

<div class="kicker">Main result · activity classification</div>

## HHAR: TSFEL45 leads both mean rank and macro F1

<div class="body top result-split">
  <img class="result-figure" src="assets/hhar-rank-distribution.svg" alt="HHAR rank distributions across ten methods">
  <div class="result-callout">
    <div class="eyebrow">mean rank ↓</div><div class="value">3.76</div><div class="detail"><strong>TSFEL45</strong> has the lowest mean rank over 80 matched HHAR settings.</div>
    <div class="divider"></div>
    <div class="eyebrow">mean macro F1 ↑</div><div class="value" style="font-size:34px">0.79</div><div class="comparison">Barlow / SimCLR mean rank: <strong>4.43</strong></div>
  </div>
</div>

<div class="source">Source: supplied manuscript, Figure 1b, Table 3, and §4.2. Lower rank and higher macro F1 are better.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 4, Table 3; pp. 4–5, §4.2; p. 6, Figure 1b.
- Exact values: TSFEL45 mean rank 3.76 and mean macro F1 0.79; Barlow and SimCLR mean rank 4.43.
- Rank-distribution whisker/IQR/median geometry was reconstructed from the supplied paper figure. Its stale dashed mean marker was replaced with the exact final-manuscript mean rank from Table 3; the filled dot and right-column value are canonical.
-->

---

<div class="kicker">Representation transfer · frozen encoder</div>

## In frozen evaluation, a TSFEL variant leads on both tasks

<div class="body top">
  <img class="full-result" src="assets/frozen-transfer.svg" alt="Best feature-target and conventional baseline ranks under frozen and unfrozen transfer for HHAR and PPG-DaLiA">
  <div class="takeaway">Each comparison selects the best member of each method family within that task and transfer regime.</div>
</div>

<div class="source">Source: supplied manuscript, Tables 4–5 and §4.3.1. Only internally consistent average-rank columns are used.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 5, Table 4 (HHAR) and Table 5 (PPG-DaLiA); p. 5, §4.3.1.
- Frozen: HHAR TSFEL45 2.68 vs BYOL 4.02; PPG-DaLiA TSFEL15 3.46 vs Barlow 4.38.
- Unfrozen context: HHAR TSFEL90 3.64 vs Barlow 3.90; PPG-DaLiA TSFEL30 3.85 vs MPM 5.51.
- Best family member changes by slice; the graphic does not compare one fixed TSFEL method against one fixed baseline.
- Table 5 integrity note: its caption states an unfrozen TSFEL30 MAE of 7.11 BPM, but active cells report 10.07, 7.47, and 6.93 for TSFEL30/45/90. This slide intentionally uses rank columns only and does not reproduce 7.11.
-->

---

<div class="kicker">Architecture · robustness</div>

## On PPG-DaLiA, feature targets lead across all four backbones

<div class="body top">
  <img class="full-result" src="assets/ppg-backbone-generalization.svg" alt="Per-backbone normalized rank comparison on PPG-DaLiA">
  <div class="takeaway">The regression advantage is not confined to one encoder family; HHAR is more backbone dependent.</div>
</div>

<div class="source">Source: supplied manuscript, §4.3.3. Lower normalized rank is better.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 6, §4.3.3 Effect of Backbone Architecture.
- Exact PPG-DaLiA best-TSFEL versus closest-baseline normalized ranks: MLP 2.0 vs 4.2; MLP-Mixer 3.4 vs 5.8; ResNet-18 3.2 vs 4.6; PatchTST 3.6 vs 3.8.
- Boundary: the manuscript reports more varied HHAR behavior, including SimCLR outperforming TSFEL on MLP-Mixer. The slide therefore limits its headline to PPG-DaLiA.
- Graphic is an editable SVG reconstructed from the manuscript's exact prose values.
-->

---

<div class="kicker">Efficiency · paper's compute proxy</div>

## Feature targets occupy the lower-left network-pass region

<div class="body top">
  <div class="compute-grid">
    <div class="compute-panel"><h3>PPG-DaLiA</h3><img src="assets/compute-tradeoff-ppg-highlight.svg" alt="PPG-DaLiA average rank versus network-pass proxy"></div>
    <div class="compute-panel"><h3>HHAR</h3><img src="assets/compute-tradeoff-hhar-highlight.svg" alt="HHAR average rank versus network-pass proxy"></div>
  </div>
  <div class="compute-note"><span><b>Preferred direction:</b> lower left</span><span>Proxy ≠ wall-clock time, FLOPs, memory, energy, or carbon.</span></div>
</div>

<div class="source">Source: supplied manuscript, Figure 2 and §4.4. Original point geometry is preserved.</div>

<!--
[Sources]
- Supplied workshop manuscript, pp. 6–7, §4.4 and Figure 2.
- The x-axis is proportional to network passes required for training. It is not a measured wall-clock, FLOP, memory, energy, or carbon quantity.
- SVG paths and point geometry are preserved from the paper's supplied vector figure. Colors, direct labels, and the x-axis wording were revised for precision and legibility; no exact x-values were inferred or quoted.
-->

---

<div class="kicker">Ablation · target size</div>

## The preferred descriptor count differs by task

<div class="body top ablation-layout">
  <img src="assets/feature-count-ablation.svg" alt="Mean rank across TSFEL descriptor counts for PPG-DaLiA and HHAR">
  <div class="ablation-callout">
    <div class="ablation-item"><div class="count">15</div><div class="label"><strong>PPG-DaLiA</strong><br>lowest mean rank: 3.95</div></div>
    <div class="ablation-item hhar"><div class="count">45</div><div class="label"><strong>HHAR</strong><br>lowest mean rank: 3.76</div></div>
    <div class="small">More targets do not improve mean rank monotonically.</div>
  </div>
</div>

<div class="source">Source: supplied manuscript, Tables 2–3 and §4.3.2. Lower mean rank is better.</div>

<!--
[Sources]
- Supplied workshop manuscript, Tables 2–3 and p. 6, §4.3.2.
- Exact PPG-DaLiA mean ranks for 15/30/45/90 descriptors: 3.95, 4.15, 6.62, 5.88.
- Exact HHAR mean ranks: 4.64, 4.56, 3.76, 4.37.
- Graphic is an editable SVG reconstructed from those exact table values. No trendline is fitted.
-->

---

<div class="kicker">Limits · what remains unresolved</div>

## The experiments do not establish mechanism or broad transfer

<div class="body top limits-field">
  <div class="tested-field">
    <div class="tested-node"><b>Two short-window wearable benchmarks</b><span>Heart-rate regression and six-class activity recognition.</span></div>
    <div class="tested-node"><b>Matched evaluation across four backbones</b><span>Aggregate ranks over 1,600 training runs.</span></div>
    <div class="tested-node"><b>Frozen and unfrozen transfer</b><span>Useful evidence on the evaluated tasks—not a universal claim.</span></div>
  </div>
  <div class="unresolved">
    <div class="label">not established</div>
    <h3>Mechanism and scope</h3>
    <ul>
      <li>Statistical, temporal, and spectral families are not disentangled.</li>
      <li>No principled rule selects 15 / 30 / 45 / 90 targets.</li>
      <li>Long-context, forecasting, anomaly, and cross-domain transfer are untested.</li>
      <li>Augmentation-induced semantic loss is illustrated, not directly measured.</li>
    </ul>
  </div>
</div>

<div class="source">Source: supplied manuscript, §7 Limitations.</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 7, §7 Limitations.
- The limitations copy closely follows the manuscript: descriptor choice remains an inductive bias; feature families are not ablated; subset selection lacks a principled rule; evaluation is limited to two wearable benchmarks with short fixed windows; motivating augmentation failures are not directly probed.
-->

---

<!-- _class: closing -->
<!-- _footer: '' -->

<div class="kicker">Conclusion · bounded claim</div>

<div class="closing-grid">
  <div>

# Engineered descriptors provide useful self-supervision on the evaluated wearable tasks

  <div class="evidence-list">
    <div class="evidence-row"><div class="mark">01</div><div>Lowest task-level mean ranks on PPG-DaLiA and HHAR</div></div>
    <div class="evidence-row"><div class="mark">02</div><div>Leading best-of-family ranks with a frozen encoder on both tasks</div></div>
    <div class="evidence-row"><div class="mark">03</div><div>Favorable position under the paper's network-pass proxy</div></div>
  </div>
  <div class="closing-boundary">A complement to augmentation and reconstruction—not a universal replacement.</div>
  </div>
  <div class="closing-visual"><img src="assets/ppg-descriptor-views.svg" alt="Authentic PPG window shown through complementary descriptor views"></div>
</div>

<div class="closing-contact">nipun.batra@iitgn.ac.in · Sustainability Lab, IIT Gandhinagar</div>

<!--
[Sources]
- Supplied workshop manuscript, p. 7, §8 Conclusion.
- Task-level ranks: Tables 2–3. Frozen-transfer best-of-family ranks: Tables 4–5. Network-pass comparison: Figure 2 and §4.4.
- Closing visual: PPG-DaLiA Subject 1, samples 73,120–73,375 at 32 Hz, from the Edge Impulse subset of the UCI dataset, DOI 10.24432/C53890; subset documentation: https://docs.edgeimpulse.com/tutorials/end-to-end/hr-hrv-estimation . Derived distribution, autocorrelation, and periodogram values are documented in `provenance/ppg-intuition-assets.md`.
- The boundary statement mirrors the manuscript's conclusion that descriptor prediction is complementary to augmentation- and reconstruction-based approaches rather than universally superior.
-->
