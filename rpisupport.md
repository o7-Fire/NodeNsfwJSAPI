###Comment from line 12 to line 14 of src/NSFWModel.js

replace in line 10 : haveAVX = "true";

###then recompile your tensorflow manually

guide on how to : https://github.com/tensorflow/tfjs/issues/5173

```
Platform node has already been set. Overwriting the platform with [object Object].
cpu backend was already registered. Reusing existing backend factory.
The kernel '_FusedMatMul' for backend 'cpu' is already registered
The kernel 'Abs' for backend 'cpu' is already registered
The kernel 'Acos' for backend 'cpu' is already registered
The kernel 'Acosh' for backend 'cpu' is already registered
The kernel 'Add' for backend 'cpu' is already registered
The kernel 'AddN' for backend 'cpu' is already registered
The kernel 'All' for backend 'cpu' is already registered
The kernel 'Any' for backend 'cpu' is already registered
The kernel 'ArgMax' for backend 'cpu' is already registered
The kernel 'ArgMin' for backend 'cpu' is already registered
The kernel 'Asin' for backend 'cpu' is already registered
The kernel 'Asinh' for backend 'cpu' is already registered
The kernel 'Atan' for backend 'cpu' is already registered
The kernel 'Atan2' for backend 'cpu' is already registered
The kernel 'Atanh' for backend 'cpu' is already registered
The kernel 'AvgPool' for backend 'cpu' is already registered
The kernel 'AvgPool3D' for backend 'cpu' is already registered
The kernel 'AvgPool3DGrad' for backend 'cpu' is already registered
The kernel 'AvgPoolGrad' for backend 'cpu' is already registered
The kernel 'BatchMatMul' for backend 'cpu' is already registered
The kernel 'FusedBatchNorm' for backend 'cpu' is already registered
The kernel 'BatchToSpaceND' for backend 'cpu' is already registered
The kernel 'Bincount' for backend 'cpu' is already registered
The kernel 'Cast' for backend 'cpu' is already registered
The kernel 'Ceil' for backend 'cpu' is already registered
The kernel 'ClipByValue' for backend 'cpu' is already registered
The kernel 'Complex' for backend 'cpu' is already registered
The kernel 'ComplexAbs' for backend 'cpu' is already registered
The kernel 'Concat' for backend 'cpu' is already registered
The kernel 'Conv2DBackpropFilter' for backend 'cpu' is already registered
The kernel 'Conv2DBackpropInput' for backend 'cpu' is already registered
The kernel 'Conv2D' for backend 'cpu' is already registered
The kernel 'Conv3DBackpropFilterV2' for backend 'cpu' is already registered
The kernel 'Conv3DBackpropInputV2' for backend 'cpu' is already registered
The kernel 'Conv3D' for backend 'cpu' is already registered
The kernel 'Cos' for backend 'cpu' is already registered
The kernel 'Cosh' for backend 'cpu' is already registered
The kernel 'CropAndResize' for backend 'cpu' is already registered
The kernel 'Cumsum' for backend 'cpu' is already registered
The kernel 'DenseBincount' for backend 'cpu' is already registered
The kernel 'DepthToSpace' for backend 'cpu' is already registered
The kernel 'DepthwiseConv2dNative' for backend 'cpu' is already registered
The kernel 'DepthwiseConv2dNativeBackpropFilter' for backend 'cpu' is already registered
The kernel 'DepthwiseConv2dNativeBackpropInput' for backend 'cpu' is already registered
The kernel 'Diag' for backend 'cpu' is already registered
The kernel 'Dilation2D' for backend 'cpu' is already registered
The kernel 'Dilation2DBackpropInput' for backend 'cpu' is already registered
The kernel 'Dilation2DBackpropFilter' for backend 'cpu' is already registered
The kernel 'RealDiv' for backend 'cpu' is already registered
The kernel 'Elu' for backend 'cpu' is already registered
The kernel 'EluGrad' for backend 'cpu' is already registered
The kernel 'Equal' for backend 'cpu' is already registered
The kernel 'Erf' for backend 'cpu' is already registered
The kernel 'Exp' for backend 'cpu' is already registered
The kernel 'ExpandDims' for backend 'cpu' is already registered
The kernel 'Expm1' for backend 'cpu' is already registered
The kernel 'FFT' for backend 'cpu' is already registered
The kernel 'Fill' for backend 'cpu' is already registered
The kernel 'FlipLeftRight' for backend 'cpu' is already registered
The kernel 'Floor' for backend 'cpu' is already registered
The kernel 'FloorDiv' for backend 'cpu' is already registered
The kernel 'FusedConv2D' for backend 'cpu' is already registered
The kernel 'FusedDepthwiseConv2D' for backend 'cpu' is already registered
The kernel 'GatherNd' for backend 'cpu' is already registered
The kernel 'GatherV2' for backend 'cpu' is already registered
The kernel 'Greater' for backend 'cpu' is already registered
The kernel 'GreaterEqual' for backend 'cpu' is already registered
The kernel 'Identity' for backend 'cpu' is already registered
The kernel 'IFFT' for backend 'cpu' is already registered
The kernel 'Imag' for backend 'cpu' is already registered
The kernel 'IsFinite' for backend 'cpu' is already registered
The kernel 'IsInf' for backend 'cpu' is already registered
The kernel 'IsNan' for backend 'cpu' is already registered
The kernel 'LeakyRelu' for backend 'cpu' is already registered
The kernel 'Less' for backend 'cpu' is already registered
The kernel 'LessEqual' for backend 'cpu' is already registered
The kernel 'LinSpace' for backend 'cpu' is already registered
The kernel 'Log' for backend 'cpu' is already registered
The kernel 'Log1p' for backend 'cpu' is already registered
The kernel 'LogicalAnd' for backend 'cpu' is already registered
The kernel 'LogicalNot' for backend 'cpu' is already registered
The kernel 'LogicalOr' for backend 'cpu' is already registered
The kernel 'LRN' for backend 'cpu' is already registered
The kernel 'LRNGrad' for backend 'cpu' is already registered
The kernel 'Maximum' for backend 'cpu' is already registered
The kernel 'MaxPool' for backend 'cpu' is already registered
The kernel 'MaxPool3D' for backend 'cpu' is already registered
The kernel 'MaxPool3DGrad' for backend 'cpu' is already registered
The kernel 'MaxPoolGrad' for backend 'cpu' is already registered
The kernel 'MaxPoolWithArgmax' for backend 'cpu' is already registered
The kernel 'Max' for backend 'cpu' is already registered
The kernel 'Mean' for backend 'cpu' is already registered
The kernel 'Min' for backend 'cpu' is already registered
The kernel 'Minimum' for backend 'cpu' is already registered
The kernel 'MirrorPad' for backend 'cpu' is already registered
The kernel 'Mod' for backend 'cpu' is already registered
The kernel 'Multinomial' for backend 'cpu' is already registered
The kernel 'Multiply' for backend 'cpu' is already registered
The kernel 'Neg' for backend 'cpu' is already registered
The kernel 'NonMaxSuppressionV3' for backend 'cpu' is already registered
The kernel 'NonMaxSuppressionV4' for backend 'cpu' is already registered
The kernel 'NonMaxSuppressionV5' for backend 'cpu' is already registered
The kernel 'NotEqual' for backend 'cpu' is already registered
The kernel 'OneHot' for backend 'cpu' is already registered
The kernel 'OnesLike' for backend 'cpu' is already registered
The kernel 'Pack' for backend 'cpu' is already registered
The kernel 'PadV2' for backend 'cpu' is already registered
The kernel 'Pow' for backend 'cpu' is already registered
The kernel 'Prelu' for backend 'cpu' is already registered
The kernel 'Prod' for backend 'cpu' is already registered
The kernel 'Range' for backend 'cpu' is already registered
The kernel 'Real' for backend 'cpu' is already registered
The kernel 'Reciprocal' for backend 'cpu' is already registered
The kernel 'Relu' for backend 'cpu' is already registered
The kernel 'Relu6' for backend 'cpu' is already registered
The kernel 'Reshape' for backend 'cpu' is already registered
The kernel 'ResizeBilinear' for backend 'cpu' is already registered
The kernel 'ResizeBilinearGrad' for backend 'cpu' is already registered
The kernel 'ResizeNearestNeighbor' for backend 'cpu' is already registered
The kernel 'ResizeNearestNeighborGrad' for backend 'cpu' is already registered
The kernel 'Reverse' for backend 'cpu' is already registered
The kernel 'RotateWithOffset' for backend 'cpu' is already registered
The kernel 'Round' for backend 'cpu' is already registered
The kernel 'Rsqrt' for backend 'cpu' is already registered
The kernel 'ScatterNd' for backend 'cpu' is already registered
The kernel 'Select' for backend 'cpu' is already registered
The kernel 'Selu' for backend 'cpu' is already registered
The kernel 'Sigmoid' for backend 'cpu' is already registered
The kernel 'Sign' for backend 'cpu' is already registered
The kernel 'Sin' for backend 'cpu' is already registered
The kernel 'Sinh' for backend 'cpu' is already registered
The kernel 'Slice' for backend 'cpu' is already registered
The kernel 'Softmax' for backend 'cpu' is already registered
The kernel 'Softplus' for backend 'cpu' is already registered
The kernel 'SpaceToBatchND' for backend 'cpu' is already registered
The kernel 'SparseToDense' for backend 'cpu' is already registered
The kernel 'SplitV' for backend 'cpu' is already registered
The kernel 'Sqrt' for backend 'cpu' is already registered
The kernel 'Square' for backend 'cpu' is already registered
The kernel 'SquaredDifference' for backend 'cpu' is already registered
The kernel 'Step' for backend 'cpu' is already registered
The kernel 'StridedSlice' for backend 'cpu' is already registered
The kernel 'Sub' for backend 'cpu' is already registered
The kernel 'Sum' for backend 'cpu' is already registered
The kernel 'Tan' for backend 'cpu' is already registered
The kernel 'Tanh' for backend 'cpu' is already registered
The kernel 'Tile' for backend 'cpu' is already registered
The kernel 'TopK' for backend 'cpu' is already registered
The kernel 'Transpose' for backend 'cpu' is already registered
The kernel 'Transform' for backend 'cpu' is already registered
The kernel 'Unique' for backend 'cpu' is already registered
The kernel 'Unpack' for backend 'cpu' is already registered
The kernel 'UnsortedSegmentSum' for backend 'cpu' is already registered
The kernel 'ZerosLike' for backend 'cpu' is already registered
The kernel 'LRN' for backend 'webgl' is already registered
The kernel 'LRNGrad' for backend 'webgl' is already registered
The kernel '_FusedMatMul' for backend 'webgl' is already registered
The kernel 'Abs' for backend 'webgl' is already registered
The kernel 'Acos' for backend 'webgl' is already registered
The kernel 'Acosh' for backend 'webgl' is already registered
The kernel 'Add' for backend 'webgl' is already registered
The kernel 'AddN' for backend 'webgl' is already registered
The kernel 'All' for backend 'webgl' is already registered
The kernel 'Any' for backend 'webgl' is already registered
The kernel 'ArgMax' for backend 'webgl' is already registered
The kernel 'ArgMin' for backend 'webgl' is already registered
The kernel 'Asin' for backend 'webgl' is already registered
The kernel 'Asinh' for backend 'webgl' is already registered
The kernel 'Atan2' for backend 'webgl' is already registered
The kernel 'Atan' for backend 'webgl' is already registered
The kernel 'Atanh' for backend 'webgl' is already registered
The kernel 'AvgPool3D' for backend 'webgl' is already registered
The kernel 'AvgPool' for backend 'webgl' is already registered
The kernel 'AvgPool3DGrad' for backend 'webgl' is already registered
The kernel 'AvgPoolGrad' for backend 'webgl' is already registered
The kernel 'BatchMatMul' for backend 'webgl' is already registered
The kernel 'FusedBatchNorm' for backend 'webgl' is already registered
The kernel 'BatchToSpaceND' for backend 'webgl' is already registered
The kernel 'Bincount' for backend 'webgl' is already registered
The kernel 'Cast' for backend 'webgl' is already registered
The kernel 'Ceil' for backend 'webgl' is already registered
The kernel 'ClipByValue' for backend 'webgl' is already registered
The kernel 'ComplexAbs' for backend 'webgl' is already registered
The kernel 'Complex' for backend 'webgl' is already registered
The kernel 'Concat' for backend 'webgl' is already registered
The kernel 'Conv2DBackpropFilter' for backend 'webgl' is already registered
The kernel 'Conv2DBackpropInput' for backend 'webgl' is already registered
The kernel 'Conv2D' for backend 'webgl' is already registered
The kernel 'Conv3DBackpropFilterV2' for backend 'webgl' is already registered
The kernel 'Conv3DBackpropInputV2' for backend 'webgl' is already registered
The kernel 'Conv3D' for backend 'webgl' is already registered
The kernel 'Cos' for backend 'webgl' is already registered
The kernel 'Cosh' for backend 'webgl' is already registered
The kernel 'CropAndResize' for backend 'webgl' is already registered
The kernel 'Cumsum' for backend 'webgl' is already registered
The kernel 'DenseBincount' for backend 'webgl' is already registered
The kernel 'DepthToSpace' for backend 'webgl' is already registered
The kernel 'DepthwiseConv2dNativeBackpropFilter' for backend 'webgl' is already registered
The kernel 'DepthwiseConv2dNativeBackpropInput' for backend 'webgl' is already registered
The kernel 'DepthwiseConv2dNative' for backend 'webgl' is already registered
The kernel 'Diag' for backend 'webgl' is already registered
The kernel 'Dilation2D' for backend 'webgl' is already registered
The kernel 'Elu' for backend 'webgl' is already registered
The kernel 'EluGrad' for backend 'webgl' is already registered
The kernel 'Equal' for backend 'webgl' is already registered
The kernel 'Erf' for backend 'webgl' is already registered
The kernel 'Exp' for backend 'webgl' is already registered
The kernel 'ExpandDims' for backend 'webgl' is already registered
The kernel 'Expm1' for backend 'webgl' is already registered
The kernel 'FFT' for backend 'webgl' is already registered
The kernel 'Fill' for backend 'webgl' is already registered
The kernel 'FlipLeftRight' for backend 'webgl' is already registered
The kernel 'Floor' for backend 'webgl' is already registered
The kernel 'FloorDiv' for backend 'webgl' is already registered
The kernel 'FromPixels' for backend 'webgl' is already registered
The kernel 'FusedConv2D' for backend 'webgl' is already registered
The kernel 'FusedDepthwiseConv2D' for backend 'webgl' is already registered
The kernel 'GatherNd' for backend 'webgl' is already registered
The kernel 'GatherV2' for backend 'webgl' is already registered
The kernel 'Greater' for backend 'webgl' is already registered
The kernel 'GreaterEqual' for backend 'webgl' is already registered
The kernel 'Identity' for backend 'webgl' is already registered
The kernel 'IFFT' for backend 'webgl' is already registered
The kernel 'Imag' for backend 'webgl' is already registered
The kernel 'IsFinite' for backend 'webgl' is already registered
The kernel 'IsInf' for backend 'webgl' is already registered
The kernel 'IsNan' for backend 'webgl' is already registered
The kernel 'LeakyRelu' for backend 'webgl' is already registered
The kernel 'Less' for backend 'webgl' is already registered
The kernel 'LessEqual' for backend 'webgl' is already registered
The kernel 'LinSpace' for backend 'webgl' is already registered
The kernel 'Log1p' for backend 'webgl' is already registered
The kernel 'Log' for backend 'webgl' is already registered
The kernel 'LogicalAnd' for backend 'webgl' is already registered
The kernel 'LogicalNot' for backend 'webgl' is already registered
The kernel 'LogicalOr' for backend 'webgl' is already registered
The kernel 'Max' for backend 'webgl' is already registered
The kernel 'MaxPool3D' for backend 'webgl' is already registered
The kernel 'MaxPool' for backend 'webgl' is already registered
The kernel 'MaxPool3DGrad' for backend 'webgl' is already registered
The kernel 'MaxPoolGrad' for backend 'webgl' is already registered
The kernel 'MaxPoolWithArgmax' for backend 'webgl' is already registered
The kernel 'Maximum' for backend 'webgl' is already registered
The kernel 'Mean' for backend 'webgl' is already registered
The kernel 'Min' for backend 'webgl' is already registered
The kernel 'Minimum' for backend 'webgl' is already registered
The kernel 'MirrorPad' for backend 'webgl' is already registered
The kernel 'Mod' for backend 'webgl' is already registered
The kernel 'Multinomial' for backend 'webgl' is already registered
The kernel 'Multiply' for backend 'webgl' is already registered
The kernel 'Neg' for backend 'webgl' is already registered
The kernel 'NonMaxSuppressionV3' for backend 'webgl' is already registered
The kernel 'NonMaxSuppressionV4' for backend 'webgl' is already registered
The kernel 'NonMaxSuppressionV5' for backend 'webgl' is already registered
The kernel 'NotEqual' for backend 'webgl' is already registered
The kernel 'OneHot' for backend 'webgl' is already registered
The kernel 'OnesLike' for backend 'webgl' is already registered
The kernel 'Pack' for backend 'webgl' is already registered
The kernel 'PadV2' for backend 'webgl' is already registered
The kernel 'Pow' for backend 'webgl' is already registered
The kernel 'Prelu' for backend 'webgl' is already registered
The kernel 'Prod' for backend 'webgl' is already registered
The kernel 'Range' for backend 'webgl' is already registered
The kernel 'Real' for backend 'webgl' is already registered
The kernel 'RealDiv' for backend 'webgl' is already registered
The kernel 'Reciprocal' for backend 'webgl' is already registered
The kernel 'Relu6' for backend 'webgl' is already registered
The kernel 'Relu' for backend 'webgl' is already registered
The kernel 'Reshape' for backend 'webgl' is already registered
The kernel 'ResizeBilinear' for backend 'webgl' is already registered
The kernel 'ResizeBilinearGrad' for backend 'webgl' is already registered
The kernel 'ResizeNearestNeighbor' for backend 'webgl' is already registered
The kernel 'ResizeNearestNeighborGrad' for backend 'webgl' is already registered
The kernel 'Reverse' for backend 'webgl' is already registered
The kernel 'RotateWithOffset' for backend 'webgl' is already registered
The kernel 'Round' for backend 'webgl' is already registered
The kernel 'Rsqrt' for backend 'webgl' is already registered
The kernel 'ScatterNd' for backend 'webgl' is already registered
The kernel 'Select' for backend 'webgl' is already registered
The kernel 'Selu' for backend 'webgl' is already registered
The kernel 'Sigmoid' for backend 'webgl' is already registered
The kernel 'Sign' for backend 'webgl' is already registered
The kernel 'Sin' for backend 'webgl' is already registered
The kernel 'Sinh' for backend 'webgl' is already registered
The kernel 'Slice' for backend 'webgl' is already registered
The kernel 'Softmax' for backend 'webgl' is already registered
The kernel 'Softplus' for backend 'webgl' is already registered
The kernel 'SpaceToBatchND' for backend 'webgl' is already registered
The kernel 'SparseToDense' for backend 'webgl' is already registered
The kernel 'SplitV' for backend 'webgl' is already registered
The kernel 'Sqrt' for backend 'webgl' is already registered
The kernel 'Square' for backend 'webgl' is already registered
The kernel 'SquaredDifference' for backend 'webgl' is already registered
The kernel 'Step' for backend 'webgl' is already registered
The kernel 'StridedSlice' for backend 'webgl' is already registered
The kernel 'Sub' for backend 'webgl' is already registered
The kernel 'Sum' for backend 'webgl' is already registered
The kernel 'Tan' for backend 'webgl' is already registered
The kernel 'Tanh' for backend 'webgl' is already registered
The kernel 'Tile' for backend 'webgl' is already registered
The kernel 'TopK' for backend 'webgl' is already registered
The kernel 'Transform' for backend 'webgl' is already registered
The kernel 'Transpose' for backend 'webgl' is already registered
The kernel 'Unique' for backend 'webgl' is already registered
The kernel 'Unpack' for backend 'webgl' is already registered
The kernel 'UnsortedSegmentSum' for backend 'webgl' is already registered
The kernel 'ZerosLike' for backend 'webgl' is already registered
No REDIS_URL or MEMCACHED_HOST in environment, using default caching
Http server listing on port : 5656
http://localhost:5656
The NSFW Model was loaded successfully!
```

Output you will get if you did everything right
