## Blazing Fast 🚀 NSFW API Detection with NodeJS
![](https://img.shields.io/librariesio/github/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/workflow/status/o7-Fire/NodeNsfwJSAPI/Node.js%20CI?event=push&style=flat-square)
![](https://img.shields.io/github/v/release/o7-Fire/NodeNsfwJSAPI?style=flat-square)

![](https://img.shields.io/github/license/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/stars/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/forks/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/contributors/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/repo-size/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/languages/code-size/o7-Fire/NodeNsfwJSAPI?style=flat-square)
![](https://img.shields.io/github/languages/top/o7-Fire/NodeNsfwJSAPI?style=flat-square)
## Proof of Concept & API
<details open>
  <summary>Proof of Concept & API</summary>
  <img src="https://cdn.discordapp.com/attachments/997385080047673415/1000561451938881566/unknown.png" name="1">
  <img src="https://user-images.githubusercontent.com/49940811/204943613-580e107f-9ca4-4435-b7b7-44309ab55161.png" name="2">
  <img src="https://user-images.githubusercontent.com/49940811/204942756-bd220b3b-0c84-4433-8d55-6c8dbeec2dea.png" name="3">
  <img src="https://cdn.discordapp.com/attachments/840041811384860708/872867517125771355/unknown.png" name="4">
  <img src="https://cdn.discordapp.com/attachments/840041811384860708/872865181213032518/unknown.png" name="5">
  <img src="https://user-images.githubusercontent.com/49940811/206965088-ecde528e-a874-4444-af4a-613daff23d36.png" name="6">
</details>

## Installing Tensorflow.js and Requirements

TensorFlow.js for Node currently supports the following platforms:

The platforms listed include Mac OS X, Linux, and Windows operating systems, and support is provided for both CPU and GPU environments. Developers who want to use TensorFlow.js for Node on these platforms will need to ensure that their system meets the specified requirements.

- Mac OS X CPU (10.12.6 Siera or higher)
- Linux CPU (Ubuntu 14.04 or higher)
- Linux GPU (Ubuntu 14.04 or higher and Cuda 11.2 w/ CUDNN
  v8) ([see installation instructions](https://www.tensorflow.org/install/gpu#software_requirements))
- Windows CPU (Windows 7 or higher)
- Windows GPU (Windows 7 or higher and Cuda 11.2 w/ CUDNN
  v8) ([see installation instructions](https://www.tensorflow.org/install/gpu#windows_setup))

For GPU support, tfjs-node-gpu@1.2.4 or later requires the developers to have certain versions of NVIDIA software installed on their system. The specific software requirements are listed in the table below.

| Name | Version |
|---|---|
| [NVIDIA® GPU drivers](https://www.nvidia.com/Download/index.aspx) | CUDA 11.2 |
| [CUDA® Toolkit](https://developer.nvidia.com/cuda-toolkit-archive) | 11.2 |
| [cuDNN SDK](https://developer.nvidia.com/cudnn) | 8.1.0 |

Other Linux variants might also work but this project
matches [core TensorFlow installation requirements](https://www.tensorflow.org/install/source).

### Installing CPU TensorFlow.js for Node:

```bash
npm install @tensorflow/tfjs-node
```

or

```bash
yarn add @tensorflow/tfjs-node
```

### Installing GPU TensorFlow.js for Node:

```bash
npm install @tensorflow/tfjs-node-gpu
```

or

```bash
yarn add @tensorflow/tfjs-node-gpu
```

### About

Adopted from:

- https://github.com/SashiDo/content-moderation-image-api
- https://github.com/infinitered/nsfwjs

Preview:
https://api.mindustry.me
