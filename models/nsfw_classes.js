const NSFW_CLASSES = [
    'Drawing',
    'Hentai',
    'Neutral',
    'Porn',
    'Sexy'
]
// Using n1 do 1 - (n1 - n2)
// basically a matrix
// yo wtf is n1
// oh it's negative 1
// we only do top 2 K
const NSFW_CLASSES_EXTENDED = {
    Drawing: {
        Hentai: "Anime",
        Sexy: "ArtificialProvocative",
        Neutral: "DigitalDrawing"
    },
    Neutral: {
        Drawing: "Digital",
        Sexy: {n1: "NaturallyProvocative"},
        Porn: {n1: "Disturbing"},
        Hentai: {n1: "SeductiveArt"}
    },
    Sexy: {
        Neutral: "SexuallyProvocative",
        Porn: "SeductivePorn"
    },
    Porn: {
        Sexy: {n1: "PornSeductive"},
        Hentai: {n1: "HentaiClips"},
        Neutral: {n1: "SoftPorn"}
    },
    Hentai: {
        Porn: "Doujin18",
        Drawing: {n1: "R34"}
    }
}

// ?????
function interpolateClasses(t1, t2) {
    let v2;
    let c2;
    let v1;
    let c1;
    c1 = t1.label;
    v1 = t1.value;
    c2 = t2.label;
    v2 = t2.value;
    let newLabel;
    let newValue;
    if (NSFW_CLASSES_EXTENDED[c1][c2]) {
        let c3 = NSFW_CLASSES_EXTENDED[c1][c2];
        if (c3.n1) {
            newLabel = c3.n1
            newValue = 1 - (v1 - v2);
        } else {
            newLabel = c3;
            newValue = v1 - v2;
        }
    } else {
        console.log("Not implemented: " + t1.label + ":" + t2.label);
        return;
    }
    return {
        value: newValue,
        label: newLabel
    };
}

/**
 * turn any data into this
 *
 * [ {Label1: Value1, Label2: Value2}, {Label1: Value1, Label2: Value2} ]
 *
 *
 */
function standardizeData(classificationResult) {
    //check if array
    if (Array.isArray(classificationResult)) {
        if (classificationResult.length > 0) {
            if (Array.isArray(classificationResult[0])) {
                if (classificationResult[0].length > 0) {
                    if (classificationResult[0][0].label && classificationResult[0][0].value) {
                        const array = [];
                        classificationResult.forEach((result) => {
                            const subArray = {};
                            result.forEach((subResult) => {
                                subArray[subResult.label] = subResult.value;
                            });
                            array.push(subArray);
                        });
                        return array;
                    }
                }
            }
            if (classificationResult[0].label && classificationResult[0].value) {
                const array = {};
                classificationResult.forEach((result) => {
                    array[result.label] = result.value;
                });
                return [array];
            }

        }
    }
    throw new Error("Invalid Data: " + classificationResult);
}

module.exports = {
    NSFW_CLASSES,
    NSFW_CLASSES_EXTENDED,
    interpolateClasses,
    standardizeData
}