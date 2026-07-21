const fs = require("fs");
const file = "modules/dashboard/components/asterysko/AsteryskoResearchView.tsx";
const code = fs.readFileSync(file, "utf8");

// Simple state machine to extract tags, ignoring contents of curly braces to avoid { x < y }
let i = 0;
let stack = [];

while (i < code.length) {
    if (code[i] === "<") {
        // Is it a comment?
        if (code.substring(i, i+4) === "<!--") {
             i = code.indexOf("-->", i) + 3;
             continue;
        }
        
        let endTag = code.indexOf(">", i);
        if (endTag === -1) break;
        
        let tagStr = code.substring(i, endTag + 1);
        
        // Skip JSX brackets { <div/> } etc by naive approach? No, just match proper tags.
        let match = tagStr.match(/^<\/?([a-zA-Z0-9_-]+)/);
        if (match) {
            let tagName = match[1];
            if (tagStr.startsWith("</")) {
                if (stack.length === 0) {
                    console.log("Unmatched closing tag", tagName, "at index", i, "line:", code.substring(0, i).split("\\n").length);
                } else {
                    let top = stack.pop();
                    if (top.tagName !== tagName) {
                        console.log("Mismatched tag at index", i, "! Expected </" + top.tagName + "> but got </" + tagName + ">");
                        console.log("Opening tag was at index", top.index, "line:", code.substring(0, top.index).split("\\n").length);
                        console.log("Line of mismatch:", code.substring(0, i).split("\\n").length);
                        break;
                    }
                }
            } else if (!tagStr.endsWith("/>") && !tagStr.includes("=>")) {
                stack.push({ tagName, index: i });
            }
        }
        i = endTag + 1;
    } else {
        i++;
    }
}

if (stack.length > 0) {
    console.log("Unclosed tags remaining in stack:");
    stack.forEach(s => {
       console.log(s.tagName, "at line", code.substring(0, s.index).split("\\n").length);
    });
} else {
    console.log("All tags matched perfectly!");
}
