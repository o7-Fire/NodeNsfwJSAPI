## NSFW API Detection with NodeJS


###  Quickstart

https://github.com/o7-Fire/NodeNsfwJSAPI/wiki#quickstart


### Preview
- Not 100% perfect
<table align="center">
  <tbody>
    <tr>
      <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860709/872868193511825428/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860709/872868193511825428/unknown.png" />
        </a>
      </td>
      <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860708/872865181213032518/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860708/872865181213032518/unknown.png" />
        </a>
      </td>
      <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860708/872867517125771355/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860708/872867517125771355/unknown.png"/>
        </a>
      </td>
            <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860709/872868265372831785/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860709/872868265372831785/unknown.png"/>
        </a>
      </td>
    </tr>
  </tbody>
</table>
<br />

- response
- ![](https://cdn.discordapp.com/attachments/840041811384860708/872872718897385582/unknown.png)
- after processing and some cache (pi 4 B)
- ![](https://cdn.discordapp.com/attachments/997385080047673415/1000561451938881566/unknown.png)

## Tensorflow

TensorFlow.js for Node currently supports the following platforms:

- Mac OS X CPU (10.12.6 Siera or higher)
- Linux CPU (Ubuntu 14.04 or higher)
- Linux GPU (Ubuntu 14.04 or higher and Cuda 11.2 w/ CUDNN
  v8) ([see installation instructions](https://www.tensorflow.org/install/gpu#software_requirements))
- Windows CPU (Windows 7 or higher)
- Windows GPU (Windows 7 or higher and Cuda 11.2 w/ CUDNN
  v8) ([see installation instructions](https://www.tensorflow.org/install/gpu#windows_setup))

For GPU support, tfjs-node-gpu@1.2.4 or later requires the following NVIDIA® software installed on your system:

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
