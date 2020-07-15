import { calculateDialogueDuration, trimCharacterExtension, last } from "./utils";
import { token, create_token } from "./token";
import { Range, Position } from "vscode";
import { getFountainConfig } from "./configloader";
import * as vscode from 'vscode';
import { AddDialogueNumberDecoration } from "./providers/Decorations";


//Unicode uppercase letters:
//\u0041-\u005a\u00c0-\u00d6\u00d8-\u00de\u0100\u0102\u0104\u0106\u0108\u010a\u010c\u010e\u0110\u0112\u0114\u0116\u0118\u011a\u011c\u011e\u0120\u0122\u0124\u0126\u0128\u012a\u012c\u012e\u0130\u0132\u0134\u0136\u0139\u013b\u013d\u013f\u0141\u0143\u0145\u0147\u014a\u014c\u014e\u0150\u0152\u0154\u0156\u0158\u015a\u015c\u015e\u0160\u0162\u0164\u0166\u0168\u016a\u016c\u016e\u0170\u0172\u0174\u0176\u0178\u0179\u017b\u017d\u0181\u0182\u0184\u0186\u0187\u0189-\u018b\u018e-\u0191\u0193\u0194\u0196-\u0198\u019c\u019d\u019f\u01a0\u01a2\u01a4\u01a6\u01a7\u01a9\u01ac\u01ae\u01af\u01b1-\u01b3\u01b5\u01b7\u01b8\u01bc\u01c4\u01c7\u01ca\u01cd\u01cf\u01d1\u01d3\u01d5\u01d7\u01d9\u01db\u01de\u01e0\u01e2\u01e4\u01e6\u01e8\u01ea\u01ec\u01ee\u01f1\u01f4\u01f6-\u01f8\u01fa\u01fc\u01fe\u0200\u0202\u0204\u0206\u0208\u020a\u020c\u020e\u0210\u0212\u0214\u0216\u0218\u021a\u021c\u021e\u0220\u0222\u0224\u0226\u0228\u022a\u022c\u022e\u0230\u0232\u023a\u023b\u023d\u023e\u0241\u0243-\u0246\u0248\u024a\u024c\u024e\u0370\u0372\u0376\u0386\u0388-\u038a\u038c\u038e\u038f\u0391-\u03a1\u03a3-\u03ab\u03cf\u03d2-\u03d4\u03d8\u03da\u03dc\u03de\u03e0\u03e2\u03e4\u03e6\u03e8\u03ea\u03ec\u03ee\u03f4\u03f7\u03f9\u03fa\u03fd-\u042f\u0460\u0462\u0464\u0466\u0468\u046a\u046c\u046e\u0470\u0472\u0474\u0476\u0478\u047a\u047c\u047e\u0480\u048a\u048c\u048e\u0490\u0492\u0494\u0496\u0498\u049a\u049c\u049e\u04a0\u04a2\u04a4\u04a6\u04a8\u04aa\u04ac\u04ae\u04b0\u04b2\u04b4\u04b6\u04b8\u04ba\u04bc\u04be\u04c0\u04c1\u04c3\u04c5\u04c7\u04c9\u04cb\u04cd\u04d0\u04d2\u04d4\u04d6\u04d8\u04da\u04dc\u04de\u04e0\u04e2\u04e4\u04e6\u04e8\u04ea\u04ec\u04ee\u04f0\u04f2\u04f4\u04f6\u04f8\u04fa\u04fc\u04fe\u0500\u0502\u0504\u0506\u0508\u050a\u050c\u050e\u0510\u0512\u0514\u0516\u0518\u051a\u051c\u051e\u0520\u0522\u0524\u0526\u0531-\u0556\u10a0-\u10c5\u1e00\u1e02\u1e04\u1e06\u1e08\u1e0a\u1e0c\u1e0e\u1e10\u1e12\u1e14\u1e16\u1e18\u1e1a\u1e1c\u1e1e\u1e20\u1e22\u1e24\u1e26\u1e28\u1e2a\u1e2c\u1e2e\u1e30\u1e32\u1e34\u1e36\u1e38\u1e3a\u1e3c\u1e3e\u1e40\u1e42\u1e44\u1e46\u1e48\u1e4a\u1e4c\u1e4e\u1e50\u1e52\u1e54\u1e56\u1e58\u1e5a\u1e5c\u1e5e\u1e60\u1e62\u1e64\u1e66\u1e68\u1e6a\u1e6c\u1e6e\u1e70\u1e72\u1e74\u1e76\u1e78\u1e7a\u1e7c\u1e7e\u1e80\u1e82\u1e84\u1e86\u1e88\u1e8a\u1e8c\u1e8e\u1e90\u1e92\u1e94\u1e9e\u1ea0\u1ea2\u1ea4\u1ea6\u1ea8\u1eaa\u1eac\u1eae\u1eb0\u1eb2\u1eb4\u1eb6\u1eb8\u1eba\u1ebc\u1ebe\u1ec0\u1ec2\u1ec4\u1ec6\u1ec8\u1eca\u1ecc\u1ece\u1ed0\u1ed2\u1ed4\u1ed6\u1ed8\u1eda\u1edc\u1ede\u1ee0\u1ee2\u1ee4\u1ee6\u1ee8\u1eea\u1eec\u1eee\u1ef0\u1ef2\u1ef4\u1ef6\u1ef8\u1efa\u1efc\u1efe\u1f08-\u1f0f\u1f18-\u1f1d\u1f28-\u1f2f\u1f38-\u1f3f\u1f48-\u1f4d\u1f59\u1f5b\u1f5d\u1f5f\u1f68-\u1f6f\u1fb8-\u1fbb\u1fc8-\u1fcb\u1fd8-\u1fdb\u1fe8-\u1fec\u1ff8-\u1ffb\u2102\u2107\u210b-\u210d\u2110-\u2112\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u2130-\u2133\u213e\u213f\u2145\u2183\u2c00-\u2c2e\u2c60\u2c62-\u2c64\u2c67\u2c69\u2c6b\u2c6d-\u2c70\u2c72\u2c75\u2c7e-\u2c80\u2c82\u2c84\u2c86\u2c88\u2c8a\u2c8c\u2c8e\u2c90\u2c92\u2c94\u2c96\u2c98\u2c9a\u2c9c\u2c9e\u2ca0\u2ca2\u2ca4\u2ca6\u2ca8\u2caa\u2cac\u2cae\u2cb0\u2cb2\u2cb4\u2cb6\u2cb8\u2cba\u2cbc\u2cbe\u2cc0\u2cc2\u2cc4\u2cc6\u2cc8\u2cca\u2ccc\u2cce\u2cd0\u2cd2\u2cd4\u2cd6\u2cd8\u2cda\u2cdc\u2cde\u2ce0\u2ce2\u2ceb\u2ced\ua640\ua642\ua644\ua646\ua648\ua64a\ua64c\ua64e\ua650\ua652\ua654\ua656\ua658\ua65a\ua65c\ua65e\ua660\ua662\ua664\ua666\ua668\ua66a\ua66c\ua680\ua682\ua684\ua686\ua688\ua68a\ua68c\ua68e\ua690\ua692\ua694\ua696\ua722\ua724\ua726\ua728\ua72a\ua72c\ua72e\ua732\ua734\ua736\ua738\ua73a\ua73c\ua73e\ua740\ua742\ua744\ua746\ua748\ua74a\ua74c\ua74e\ua750\ua752\ua754\ua756\ua758\ua75a\ua75c\ua75e\ua760\ua762\ua764\ua766\ua768\ua76a\ua76c\ua76e\ua779\ua77b\ua77d\ua77e\ua780\ua782\ua784\ua786\ua78b\ua78d\ua790\ua7a0\ua7a2\ua7a4\ua7a6\ua7a8\uff21-\uff3a

export const regex: { [index: string]: RegExp } = {
    title_page: /(title|credit|author[s]?|source|notes|draft date|date|watermark|contact|copyright|font)\:.*/i,

    section: /^(#+)(?: *)(.*)/,
    synopsis: /^(?:\=(?!\=+) *)(.*)/,

    scene_heading: /^([.](?=[0-9a-z])|(?:[*]{0,3}_?)(?:int|ext|est|int[.]?\/ext|i[.]?\/e)[. ])(.+?)(#[-.0-9a-z]+#)?$/i,
    scene_number: /#(.+)#/,

    transition: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:|^TO\:$)|^(?:> *)(.+)/,

    //Sorry for the following regex, it's super ugly. this is what is is in human-readable form:
    ///^([*_]+[0-9{UPPERCASE LETTER UNICODE CATEGORY} (._\-')]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/
    dialogue: /^([*_]+[0-9\u0041-\u005a\u00c0-\u00d6\u00d8-\u00de\u0100\u0102\u0104\u0106\u0108\u010a\u010c\u010e\u0110\u0112\u0114\u0116\u0118\u011a\u011c\u011e\u0120\u0122\u0124\u0126\u0128\u012a\u012c\u012e\u0130\u0132\u0134\u0136\u0139\u013b\u013d\u013f\u0141\u0143\u0145\u0147\u014a\u014c\u014e\u0150\u0152\u0154\u0156\u0158\u015a\u015c\u015e\u0160\u0162\u0164\u0166\u0168\u016a\u016c\u016e\u0170\u0172\u0174\u0176\u0178\u0179\u017b\u017d\u0181\u0182\u0184\u0186\u0187\u0189-\u018b\u018e-\u0191\u0193\u0194\u0196-\u0198\u019c\u019d\u019f\u01a0\u01a2\u01a4\u01a6\u01a7\u01a9\u01ac\u01ae\u01af\u01b1-\u01b3\u01b5\u01b7\u01b8\u01bc\u01c4\u01c7\u01ca\u01cd\u01cf\u01d1\u01d3\u01d5\u01d7\u01d9\u01db\u01de\u01e0\u01e2\u01e4\u01e6\u01e8\u01ea\u01ec\u01ee\u01f1\u01f4\u01f6-\u01f8\u01fa\u01fc\u01fe\u0200\u0202\u0204\u0206\u0208\u020a\u020c\u020e\u0210\u0212\u0214\u0216\u0218\u021a\u021c\u021e\u0220\u0222\u0224\u0226\u0228\u022a\u022c\u022e\u0230\u0232\u023a\u023b\u023d\u023e\u0241\u0243-\u0246\u0248\u024a\u024c\u024e\u0370\u0372\u0376\u0386\u0388-\u038a\u038c\u038e\u038f\u0391-\u03a1\u03a3-\u03ab\u03cf\u03d2-\u03d4\u03d8\u03da\u03dc\u03de\u03e0\u03e2\u03e4\u03e6\u03e8\u03ea\u03ec\u03ee\u03f4\u03f7\u03f9\u03fa\u03fd-\u042f\u0460\u0462\u0464\u0466\u0468\u046a\u046c\u046e\u0470\u0472\u0474\u0476\u0478\u047a\u047c\u047e\u0480\u048a\u048c\u048e\u0490\u0492\u0494\u0496\u0498\u049a\u049c\u049e\u04a0\u04a2\u04a4\u04a6\u04a8\u04aa\u04ac\u04ae\u04b0\u04b2\u04b4\u04b6\u04b8\u04ba\u04bc\u04be\u04c0\u04c1\u04c3\u04c5\u04c7\u04c9\u04cb\u04cd\u04d0\u04d2\u04d4\u04d6\u04d8\u04da\u04dc\u04de\u04e0\u04e2\u04e4\u04e6\u04e8\u04ea\u04ec\u04ee\u04f0\u04f2\u04f4\u04f6\u04f8\u04fa\u04fc\u04fe\u0500\u0502\u0504\u0506\u0508\u050a\u050c\u050e\u0510\u0512\u0514\u0516\u0518\u051a\u051c\u051e\u0520\u0522\u0524\u0526\u0531-\u0556\u10a0-\u10c5\u1e00\u1e02\u1e04\u1e06\u1e08\u1e0a\u1e0c\u1e0e\u1e10\u1e12\u1e14\u1e16\u1e18\u1e1a\u1e1c\u1e1e\u1e20\u1e22\u1e24\u1e26\u1e28\u1e2a\u1e2c\u1e2e\u1e30\u1e32\u1e34\u1e36\u1e38\u1e3a\u1e3c\u1e3e\u1e40\u1e42\u1e44\u1e46\u1e48\u1e4a\u1e4c\u1e4e\u1e50\u1e52\u1e54\u1e56\u1e58\u1e5a\u1e5c\u1e5e\u1e60\u1e62\u1e64\u1e66\u1e68\u1e6a\u1e6c\u1e6e\u1e70\u1e72\u1e74\u1e76\u1e78\u1e7a\u1e7c\u1e7e\u1e80\u1e82\u1e84\u1e86\u1e88\u1e8a\u1e8c\u1e8e\u1e90\u1e92\u1e94\u1e9e\u1ea0\u1ea2\u1ea4\u1ea6\u1ea8\u1eaa\u1eac\u1eae\u1eb0\u1eb2\u1eb4\u1eb6\u1eb8\u1eba\u1ebc\u1ebe\u1ec0\u1ec2\u1ec4\u1ec6\u1ec8\u1eca\u1ecc\u1ece\u1ed0\u1ed2\u1ed4\u1ed6\u1ed8\u1eda\u1edc\u1ede\u1ee0\u1ee2\u1ee4\u1ee6\u1ee8\u1eea\u1eec\u1eee\u1ef0\u1ef2\u1ef4\u1ef6\u1ef8\u1efa\u1efc\u1efe\u1f08-\u1f0f\u1f18-\u1f1d\u1f28-\u1f2f\u1f38-\u1f3f\u1f48-\u1f4d\u1f59\u1f5b\u1f5d\u1f5f\u1f68-\u1f6f\u1fb8-\u1fbb\u1fc8-\u1fcb\u1fd8-\u1fdb\u1fe8-\u1fec\u1ff8-\u1ffb\u2102\u2107\u210b-\u210d\u2110-\u2112\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u2130-\u2133\u213e\u213f\u2145\u2183\u2c00-\u2c2e\u2c60\u2c62-\u2c64\u2c67\u2c69\u2c6b\u2c6d-\u2c70\u2c72\u2c75\u2c7e-\u2c80\u2c82\u2c84\u2c86\u2c88\u2c8a\u2c8c\u2c8e\u2c90\u2c92\u2c94\u2c96\u2c98\u2c9a\u2c9c\u2c9e\u2ca0\u2ca2\u2ca4\u2ca6\u2ca8\u2caa\u2cac\u2cae\u2cb0\u2cb2\u2cb4\u2cb6\u2cb8\u2cba\u2cbc\u2cbe\u2cc0\u2cc2\u2cc4\u2cc6\u2cc8\u2cca\u2ccc\u2cce\u2cd0\u2cd2\u2cd4\u2cd6\u2cd8\u2cda\u2cdc\u2cde\u2ce0\u2ce2\u2ceb\u2ced\ua640\ua642\ua644\ua646\ua648\ua64a\ua64c\ua64e\ua650\ua652\ua654\ua656\ua658\ua65a\ua65c\ua65e\ua660\ua662\ua664\ua666\ua668\ua66a\ua66c\ua680\ua682\ua684\ua686\ua688\ua68a\ua68c\ua68e\ua690\ua692\ua694\ua696\ua722\ua724\ua726\ua728\ua72a\ua72c\ua72e\ua732\ua734\ua736\ua738\ua73a\ua73c\ua73e\ua740\ua742\ua744\ua746\ua748\ua74a\ua74c\ua74e\ua750\ua752\ua754\ua756\ua758\ua75a\ua75c\ua75e\ua760\ua762\ua764\ua766\ua768\ua76a\ua76c\ua76e\ua779\ua77b\ua77d\ua77e\ua780\ua782\ua784\ua786\ua78b\ua78d\ua790\ua7a0\ua7a2\ua7a4\ua7a6\ua7a8\uff21-\uff3a (._\-')]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/,

    //Sorry for the following regex, it's super ugly. this is what is is in human-readable form:
    ///^(([{UPPERCASE LETTER UNICODE CATEGORY}0-9-\.]+(\([A-z0-9 '\-.()]+\))*|(@.*))(\s*\^)?$)/
    character: /^(([\u0041-\u005a\u00c0-\u00d6\u00d8-\u00de\u0100\u0102\u0104\u0106\u0108\u010a\u010c\u010e\u0110\u0112\u0114\u0116\u0118\u011a\u011c\u011e\u0120\u0122\u0124\u0126\u0128\u012a\u012c\u012e\u0130\u0132\u0134\u0136\u0139\u013b\u013d\u013f\u0141\u0143\u0145\u0147\u014a\u014c\u014e\u0150\u0152\u0154\u0156\u0158\u015a\u015c\u015e\u0160\u0162\u0164\u0166\u0168\u016a\u016c\u016e\u0170\u0172\u0174\u0176\u0178\u0179\u017b\u017d\u0181\u0182\u0184\u0186\u0187\u0189-\u018b\u018e-\u0191\u0193\u0194\u0196-\u0198\u019c\u019d\u019f\u01a0\u01a2\u01a4\u01a6\u01a7\u01a9\u01ac\u01ae\u01af\u01b1-\u01b3\u01b5\u01b7\u01b8\u01bc\u01c4\u01c7\u01ca\u01cd\u01cf\u01d1\u01d3\u01d5\u01d7\u01d9\u01db\u01de\u01e0\u01e2\u01e4\u01e6\u01e8\u01ea\u01ec\u01ee\u01f1\u01f4\u01f6-\u01f8\u01fa\u01fc\u01fe\u0200\u0202\u0204\u0206\u0208\u020a\u020c\u020e\u0210\u0212\u0214\u0216\u0218\u021a\u021c\u021e\u0220\u0222\u0224\u0226\u0228\u022a\u022c\u022e\u0230\u0232\u023a\u023b\u023d\u023e\u0241\u0243-\u0246\u0248\u024a\u024c\u024e\u0370\u0372\u0376\u0386\u0388-\u038a\u038c\u038e\u038f\u0391-\u03a1\u03a3-\u03ab\u03cf\u03d2-\u03d4\u03d8\u03da\u03dc\u03de\u03e0\u03e2\u03e4\u03e6\u03e8\u03ea\u03ec\u03ee\u03f4\u03f7\u03f9\u03fa\u03fd-\u042f\u0460\u0462\u0464\u0466\u0468\u046a\u046c\u046e\u0470\u0472\u0474\u0476\u0478\u047a\u047c\u047e\u0480\u048a\u048c\u048e\u0490\u0492\u0494\u0496\u0498\u049a\u049c\u049e\u04a0\u04a2\u04a4\u04a6\u04a8\u04aa\u04ac\u04ae\u04b0\u04b2\u04b4\u04b6\u04b8\u04ba\u04bc\u04be\u04c0\u04c1\u04c3\u04c5\u04c7\u04c9\u04cb\u04cd\u04d0\u04d2\u04d4\u04d6\u04d8\u04da\u04dc\u04de\u04e0\u04e2\u04e4\u04e6\u04e8\u04ea\u04ec\u04ee\u04f0\u04f2\u04f4\u04f6\u04f8\u04fa\u04fc\u04fe\u0500\u0502\u0504\u0506\u0508\u050a\u050c\u050e\u0510\u0512\u0514\u0516\u0518\u051a\u051c\u051e\u0520\u0522\u0524\u0526\u0531-\u0556\u10a0-\u10c5\u1e00\u1e02\u1e04\u1e06\u1e08\u1e0a\u1e0c\u1e0e\u1e10\u1e12\u1e14\u1e16\u1e18\u1e1a\u1e1c\u1e1e\u1e20\u1e22\u1e24\u1e26\u1e28\u1e2a\u1e2c\u1e2e\u1e30\u1e32\u1e34\u1e36\u1e38\u1e3a\u1e3c\u1e3e\u1e40\u1e42\u1e44\u1e46\u1e48\u1e4a\u1e4c\u1e4e\u1e50\u1e52\u1e54\u1e56\u1e58\u1e5a\u1e5c\u1e5e\u1e60\u1e62\u1e64\u1e66\u1e68\u1e6a\u1e6c\u1e6e\u1e70\u1e72\u1e74\u1e76\u1e78\u1e7a\u1e7c\u1e7e\u1e80\u1e82\u1e84\u1e86\u1e88\u1e8a\u1e8c\u1e8e\u1e90\u1e92\u1e94\u1e9e\u1ea0\u1ea2\u1ea4\u1ea6\u1ea8\u1eaa\u1eac\u1eae\u1eb0\u1eb2\u1eb4\u1eb6\u1eb8\u1eba\u1ebc\u1ebe\u1ec0\u1ec2\u1ec4\u1ec6\u1ec8\u1eca\u1ecc\u1ece\u1ed0\u1ed2\u1ed4\u1ed6\u1ed8\u1eda\u1edc\u1ede\u1ee0\u1ee2\u1ee4\u1ee6\u1ee8\u1eea\u1eec\u1eee\u1ef0\u1ef2\u1ef4\u1ef6\u1ef8\u1efa\u1efc\u1efe\u1f08-\u1f0f\u1f18-\u1f1d\u1f28-\u1f2f\u1f38-\u1f3f\u1f48-\u1f4d\u1f59\u1f5b\u1f5d\u1f5f\u1f68-\u1f6f\u1fb8-\u1fbb\u1fc8-\u1fcb\u1fd8-\u1fdb\u1fe8-\u1fec\u1ff8-\u1ffb\u2102\u2107\u210b-\u210d\u2110-\u2112\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u2130-\u2133\u213e\u213f\u2145\u2183\u2c00-\u2c2e\u2c60\u2c62-\u2c64\u2c67\u2c69\u2c6b\u2c6d-\u2c70\u2c72\u2c75\u2c7e-\u2c80\u2c82\u2c84\u2c86\u2c88\u2c8a\u2c8c\u2c8e\u2c90\u2c92\u2c94\u2c96\u2c98\u2c9a\u2c9c\u2c9e\u2ca0\u2ca2\u2ca4\u2ca6\u2ca8\u2caa\u2cac\u2cae\u2cb0\u2cb2\u2cb4\u2cb6\u2cb8\u2cba\u2cbc\u2cbe\u2cc0\u2cc2\u2cc4\u2cc6\u2cc8\u2cca\u2ccc\u2cce\u2cd0\u2cd2\u2cd4\u2cd6\u2cd8\u2cda\u2cdc\u2cde\u2ce0\u2ce2\u2ceb\u2ced\ua640\ua642\ua644\ua646\ua648\ua64a\ua64c\ua64e\ua650\ua652\ua654\ua656\ua658\ua65a\ua65c\ua65e\ua660\ua662\ua664\ua666\ua668\ua66a\ua66c\ua680\ua682\ua684\ua686\ua688\ua68a\ua68c\ua68e\ua690\ua692\ua694\ua696\ua722\ua724\ua726\ua728\ua72a\ua72c\ua72e\ua732\ua734\ua736\ua738\ua73a\ua73c\ua73e\ua740\ua742\ua744\ua746\ua748\ua74a\ua74c\ua74e\ua750\ua752\ua754\ua756\ua758\ua75a\ua75c\ua75e\ua760\ua762\ua764\ua766\ua768\ua76a\ua76c\ua76e\ua779\ua77b\ua77d\ua77e\ua780\ua782\ua784\ua786\ua78b\ua78d\ua790\ua7a0\ua7a2\ua7a4\ua7a6\ua7a8\uff21-\uff3a\u00270-9- \.#]+(\([A-z0-9 '\-.()]+\))*|(@.*))(\s*\^)?$)/,
    parenthetical: /^(\(.+\))$/,

    action: /^(.+)/g,
    centered: /^(?:> *)(.+)(?: *<)(\n.+)*/g,

    page_break: /^\={3,}$/,
    line_break: /^ {2}$/,

    note_inline: /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g,

    emphasis: /(_|\*{1,3}|_\*{1,3}|\*{1,3}_)(.+)(_|\*{1,3}|_\*{1,3}|\*{1,3}_)/g,
    bold_italic_underline: /(_{1}\*{3}(?=.+\*{3}_{1})|\*{3}_{1}(?=.+_{1}\*{3}))(.+?)(\*{3}_{1}|_{1}\*{3})/g,
    bold_underline: /(_{1}\*{2}(?=.+\*{2}_{1})|\*{2}_{1}(?=.+_{1}\*{2}))(.+?)(\*{2}_{1}|_{1}\*{2})/g,
    italic_underline: /(?:_{1}\*{1}(?=.+\*{1}_{1})|\*{1}_{1}(?=.+_{1}\*{1}))(.+?)(\*{1}_{1}|_{1}\*{1})/g,
    bold_italic: /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g,
    bold: /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g,
    italic: /(\*{1}(?=.+\*{1}))(.+?)(\*{1})/g,
    lyric: /^(\~.+)/g,
    underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,
};

var inline: { [index: string]: any } = {
    note: '<span class=\"note\">$1</span>',

    line_break: '<br />',

    bold_italic_underline: '<span class=\"bold italic underline\">$2</span>',
    bold_underline: '<span class=\"bold underline\">$2</span>',
    italic_underline: '<span class=\"italic underline\">$2</span>',
    bold_italic: '<span class=\"bold italic\">$2</span>',
    bold: '<span class=\"bold\">$2</span>',
    italic: '<span class=\"italic\">$2</span>',
    underline: '<span class=\"underline\">$2</span>',
    lexer: function (s: string, type: string) {
        if (!s) {
            return undefined;
        }

        var styles = ['underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline']
            , i = styles.length, style, match;

        s = s.replace(regex.note_inline, inline.note).replace(/\\\*/g, '[star]').replace(/\\_/g, '[underline]').replace(/\n/g, inline.line_break);

        // if (regex.emphasis.test(s)) {                         // this was causing only every other occurence of an emphasis syntax to be parsed
        while (i--) {
            style = styles[i];
            match = regex[style];

            if (match.test(s)) {
                s = s.replace(match, inline[style]);
            }
        }
        // }
        s = s.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_');
        if (type != "action")
            s = s.trim();
        return s;
    }
};
export class StructToken {
	text: string;
	id: any;
    children: any; //Children of the section
    range: Range; //Range of the scene/section header
    section: boolean; // true->section, false->scene
    synopses: string[];
}
export class screenplayProperties {
    scenes: { scene: string; line: number, actionLength:number, dialogueLength:number }[];
    sceneLines: number[];
    sceneNames: string[];
    titleKeys: string[];
    firstTokenLine: number;
    fontLine: number;
    lengthAction: number; //Length of the action character count
    lengthDialogue: number; //Length of the dialogue character count
    characters: Map<string, number[]>;
    structure: StructToken[];
}
export interface parseoutput {
    scriptHtml: string,
    titleHtml: string,
    title_page: any[],
    tokens: token[],
    tokenLines: { [line: number]: number }
    lengthAction: number,
    lengthDialogue: number,
    properties: screenplayProperties
}
export var parse = function (original_script: string, cfg: any, generate_html: boolean): parseoutput {
    var lastFountainEditor: vscode.Uri;
    var config = getFountainConfig(lastFountainEditor);
    var script = original_script,
        result: parseoutput = {
            title_page: [],
            tokens: [],
            scriptHtml: "",
            titleHtml: "",
            lengthAction: 0,
            lengthDialogue: 0,
            tokenLines: {},
            properties:
            {
                sceneLines: [],
                scenes: [],
                sceneNames: [],
                titleKeys: [],
                firstTokenLine: Infinity,
                fontLine: -1,
                lengthAction: 0,
                lengthDialogue: 0,
                characters: new Map<string, number[]>(),
                structure: []
            }
        };
    if (!script) {
        return result;
    }

    var new_line_length = script.match(/\r\n/) ? 2 : 1;

    if (!cfg.print_notes) {
        script = script.replace(/ {0,1}\[\[/g, " /*").replace(/\]\] {0,1}/g, "*/");
    }

    var lines = script.split(/\r\n|\r|\n/);
    var pushToken = function (token: token) {
        result.tokens.push(token);
        if (thistoken.line)
            result.tokenLines[thistoken.line] = result.tokens.length - 1;
    }

    var lines_length = lines.length,
        current = 0,
        scene_number = 1,
        current_depth = 0,
        match, text, last_title_page_token,
        thistoken: token,
        last_was_separator = false,
        //top_or_separated = false,
        token_category = "none",
        last_character_index,
        dual_right,
        state = "normal",
        cache_state_for_comment,
        nested_comments = 0,
        title_page_started = false


    var reduce_comment = function (prev: any, current: any) {
        if (current === "/*") {
            nested_comments++;
        } else if (current === "*/") {
            nested_comments--;
        } else if (!nested_comments) {
            prev = prev + current;
        }
        return prev;
    };

    var if_not_empty = function (a: any) {
        return a;
    };

    var lengthActionSoFar = 0; //total action length until the previous scene header
    var lengthDialogueSoFar = 0; //total dialogue length until the previous scene header

    var takeCount = 1; //total number of takes

    function updatePreviousSceneLength(){
        var action = result.lengthAction - lengthActionSoFar;
        var dialogue = result.lengthDialogue - lengthDialogueSoFar;
        lengthActionSoFar = result.lengthAction;
        lengthDialogueSoFar = result.lengthDialogue;

        if(result.properties.scenes.length>0){
            result.properties.scenes[result.properties.scenes.length-1].actionLength = action;
            result.properties.scenes[result.properties.scenes.length-1].dialogueLength = dialogue;
        }
    }

    for (var i = 0; i < lines_length; i++) {
        text = lines[i];

        // replace inline comments
        text = text.split(/(\/\*){1}|(\*\/){1}|([^\/\*]+)/g).filter(if_not_empty).reduce(reduce_comment, "");

        if (nested_comments && state !== "ignore") {
            cache_state_for_comment = state;
            state = "ignore";
        } else if (state === "ignore") {
            state = cache_state_for_comment;
        }

        if (nested_comments === 0 && state === "ignore") {
            state = cache_state_for_comment;
        }


        thistoken = create_token(text, current, i, new_line_length);
        current = thistoken.end + 1;


        if (text.trim().length === 0 && text !== "  ") {
            var skip_separator = cfg.merge_multiple_empty_lines && last_was_separator;

            if (state == "dialogue")
                pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_end"));
            if (state == "dual_dialogue")
                pushToken(create_token(undefined, undefined, undefined, undefined, "dual_dialogue_end"));
            state = "normal";


            if (skip_separator || state === "title_page") {
                continue;
            }

            dual_right = false;
            thistoken.type = "separator";
            last_was_separator = true;
            pushToken(thistoken);
            continue;
        }

        //top_or_separated = last_was_separator || i === 0;
        token_category = "script";

        if (!title_page_started && regex.title_page.test(thistoken.text)) {
            state = "title_page";
        }

        if (state === "title_page") {
            if (regex.title_page.test(thistoken.text)) {
                var index = thistoken.text.indexOf(":");
                thistoken.type = thistoken.text.substr(0, index).toLowerCase().replace(" ", "_");
                thistoken.text = thistoken.text.substr(index + 1).trim();
                last_title_page_token = thistoken;
                result.title_page.push(thistoken);
                title_page_started = true;
                continue;
            } else if (title_page_started) {
                last_title_page_token.text += (last_title_page_token.text ? "\n" : "") + thistoken.text.trim();
                continue;
            }
        }

        const latestSectionOrScene = (depth:number, condition: (token:StructToken)=>boolean ):StructToken => {
            try {
                if (depth==0) {
                    return null;
                } 
                else if (depth==1) {
                    return last(result.properties.structure)
                }
                else {
                    var prevSection = latestSectionOrScene(depth-1, condition)
                    if (prevSection.children != null) {
                        var lastChild = last(prevSection.children.filter(condition))
                        if (lastChild) return lastChild
                    }
                    // nest ###xyz inside #abc if there's no ##ijk to nest within
                    return prevSection;
                }
            }
            catch {
                var section:StructToken = null;
                while (!section) section = latestSectionOrScene(--depth, condition);
                return section;
            }
        }

        const latestSection = (depth:number):StructToken => latestSectionOrScene(depth, token=>token.section)
        
        if (state === "normal") {
            if (thistoken.text.match(regex.line_break)) {
                token_category = "none";
            } else if(result.properties.firstTokenLine==Infinity) {
                result.properties.firstTokenLine=thistoken.line;
            }
            if (thistoken.text.match(regex.scene_heading)) {

                thistoken.text = thistoken.text.replace(/^\./, "");
                if (cfg.each_scene_on_new_page && scene_number !== 1) {
                    var page_break = create_token();
                    page_break.type = "page_break";
                    page_break.start = thistoken.start;
                    page_break.end = thistoken.end;
                    pushToken(page_break);
                }
                thistoken.type = "scene_heading";
                thistoken.number = scene_number.toString();
                if (match = thistoken.text.match(regex.scene_number)) {
                    thistoken.text = thistoken.text.replace(regex.scene_number, "");
                    thistoken.number = match[1];
                }
                let cobj: StructToken = new StructToken();
                cobj.text = thistoken.text;
                cobj.children = null;
                cobj.range = new Range(new Position(thistoken.line, 0), new Position(thistoken.line, thistoken.text.length));
                
                if (current_depth == 0) {
					cobj.id = '/' + thistoken.line;
					result.properties.structure.push(cobj);
                }
                else {
                    var level = latestSection(current_depth);
                    cobj.id = level.id + '/' + thistoken.line;
                    level.children.push(cobj);
                }
                
                updatePreviousSceneLength();
                result.properties.scenes.push({scene: thistoken.number, line: thistoken.line, actionLength: 0, dialogueLength:0})
                result.properties.sceneLines.push(thistoken.line);
                result.properties.sceneNames.push(thistoken.text);
                scene_number++;
            } else if (thistoken.text.match(regex.centered)) {
                thistoken.type = "centered";
                thistoken.text = thistoken.text.replace(/>|</g, "").trim();
            } else if (thistoken.text.match(regex.transition)) {
                thistoken.text = thistoken.text.replace(/> ?/, "");
                thistoken.type = "transition";
            } else if (match = thistoken.text.match(regex.synopsis)) {
                thistoken.text = match[1];
                thistoken.type = thistoken.text ? "synopsis" : "separator";

                var level = latestSectionOrScene(current_depth+1, ()=>true);
                if (level) {
                    level.synopses = level.synopses || []
                    level.synopses.push(thistoken.text)
                }

            } else if (match = thistoken.text.match(regex.section)) {
                thistoken.level = match[1].length;
                thistoken.text = match[2];
                thistoken.type = "section";
                let cobj: StructToken = new StructToken();
                cobj.text = thistoken.text;
				current_depth = thistoken.level;
                cobj.children = [];
                cobj.range = new Range(new Position(thistoken.line, 0), new Position(thistoken.line, thistoken.text.length));
                cobj.section = true;

				if (current_depth == 1) {
					cobj.id = '/' + thistoken.line;
					result.properties.structure.push(cobj)
				}
				else {
                    var level = latestSection(current_depth-1);
                    cobj.id = level.id + '/' + thistoken.line;
                    level.children.push(cobj);
                }
            } else if (thistoken.text.match(regex.page_break)) {
                thistoken.text = "";
                thistoken.type = "page_break";
            } else if (thistoken.text.length && thistoken.text[0] === "!") {
                thistoken.type = "action";
                thistoken.text = thistoken.text.substr(1);
            } else if (thistoken.text.match(regex.character)) {
                if (i === lines_length || i === lines_length - 1 || lines[i + 1].trim().length === 0) {
                    thistoken.type = "action";
                } else {
                    state = "dialogue";
                    thistoken.type = "character";
                    thistoken.takeNumber = takeCount++;
                    if(config.print_dialogue_numbers) AddDialogueNumberDecoration(thistoken)
                    thistoken.text = thistoken.text.replace(/^@/, "");
                    if (thistoken.text[thistoken.text.length - 1] === "^") {
                        if (cfg.use_dual_dialogue) {
                            state = "dual_dialogue"
                            // update last dialogue to be dual:left
                            var dialogue_tokens = ["dialogue", "character", "parenthetical"];
                            while (dialogue_tokens.indexOf(result.tokens[last_character_index].type) !== -1) {
                                result.tokens[last_character_index].dual = "left";
                                last_character_index++;
                            }
                            //update last dialogue_begin to be dual_dialogue_begin and remove last dialogue_end
                            var foundmatch = false;
                            var temp_index = result.tokens.length;
                            temp_index = temp_index - 1;
                            while (!foundmatch) {
                                temp_index--;
                                switch (result.tokens[temp_index].type) {
                                    case "dialogue_end":
                                        result.tokens.splice(temp_index);
                                        temp_index--;
                                        break;
                                    case "separator": break;
                                    case "character": break;
                                    case "dialogue": break;
                                    case "parenthetical": break;
                                    case "dialogue_begin":
                                        result.tokens[temp_index].type = "dual_dialogue_begin";
                                        foundmatch = true;
                                        break;
                                    default: foundmatch = true;
                                }
                            }
                            dual_right = true;
                            thistoken.dual = "right";
                        }
                        thistoken.text = thistoken.text.replace("^", "");
                    }
                    else {
                        pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_begin"));
                    }
                    let character = trimCharacterExtension(thistoken.text)
				    if (result.properties.characters.has(character)) {
				    	var values = result.properties.characters.get(character);
				    	if (values.indexOf(scene_number) == -1) {
				    		values.push(scene_number);
				    	}
				    	result.properties.characters.set(character, values);
				    }
				    else {
				    	result.properties.characters.set(character, [scene_number]);
				    }
                    last_character_index = result.tokens.length;
                }
            }
            else {
                thistoken.type = "action";
                result.lengthAction += thistoken.text.length/20;
            }
        } else {
            if (thistoken.text.match(regex.parenthetical)) {
                thistoken.type = "parenthetical";
            } else {
                thistoken.type = "dialogue";
                thistoken.time = calculateDialogueDuration(thistoken.text);
                result.lengthDialogue += thistoken.time;
            }
            if (dual_right) {
                thistoken.dual = "right";
            }
        }

        last_was_separator = false;

        if (token_category === "script" && state !== "ignore") {
            if (thistoken.is("scene_heading", "transition")) {
                thistoken.text = thistoken.text.toUpperCase();
                title_page_started = true; // ignore title tags after first heading
            }
            if (thistoken.text && thistoken.text[0] === "~") {
                thistoken.text = "*" + thistoken.text.substr(1) + "*";
            }
            if(thistoken.type != "action" && thistoken.type !=  "dialogue")
                thistoken.text = thistoken.text.trim();
            pushToken(thistoken);
        }

    }

    if (state == "dialogue") {
        pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_end"));
    }

    if (state == "dual_dialogue") {
        pushToken(create_token(undefined, undefined, undefined, undefined, "dual_dialogue_end"));
    }

    var current_index = 0/*, previous_type = null*/;
    // tidy up separators


    if (generate_html) {
        var html = [];
        var titlehtml = [];
        //Generate html for title page
        while (current_index < result.title_page.length) {
            var current_token: token = result.title_page[current_index];
            if (current_token.text != "") {
                current_token.html = inline.lexer(current_token.text);
            }

            switch (current_token.type) {
                case 'title': titlehtml.push('<h1 class="haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</h1>'); break;
                case 'credit': titlehtml.push('<p class="credit haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'author': titlehtml.push('<p class="authors haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'authors': titlehtml.push('<p class="authors haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'source': titlehtml.push('<p class="source haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'notes': titlehtml.push('<p class="notes haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'draft_date': titlehtml.push('<p class="draft-date haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'date': titlehtml.push('<p class="date haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'contact': titlehtml.push('<p class="contact haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                case 'copyright': titlehtml.push('<p class="copyright haseditorline titlepagetoken" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
            }
            current_index++;
        }

        //Generate html for script
        current_index = 0;
        var isaction = false;
        while (current_index < result.tokens.length) {
            var current_token: token = result.tokens[current_index];
            if (current_token.text != "") {
                current_token.html = inline.lexer(current_token.text, current_token.type);
            } else  {
                current_token.html = "";
            }



            if (current_token.type == "action") {
                if (!isaction) {
                    //first action element
                    html.push('<p><span class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.html+"</span>");
                }
                else {
                    //just add a new line to the current paragraph
                    html.push('\n<span class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.html+"</span>");
                }
                isaction = true;
            }
            else if (current_token.type == "separator" && isaction) {
                if (current_index + 1 < result.tokens.length - 1) {
                    //we're not at the end
                    var next_type = result.tokens[current_index + 1].type
                    if (next_type == "action" || next_type == "separator") {
                        html.push("\n");
                    }
                }
                else if (isaction) {
                    //we're at the end
                    html.push("</p>")
                }
            }
            else {
                if (isaction) {
                    //no longer, close the paragraph
                    isaction = false;
                    html.push("</p>");
                }
                switch (current_token.type) {
                    case 'scene_heading':
                        var content = current_token.text;
                        if (cfg.embolden_scene_headers) {
                            content = '<span class=\"bold haseditorline\" id="sourceline_' + current_token.line + '">' + content + '</span>';
                        }

                        html.push('<h3 class="haseditorline" data-scenenumber=\"' + current_token.number + '\" data-position=\"' + current_token.line + '\" ' + (current_token.number ? ' id=\"sourceline_' + current_token.line + '">' : '>') + content + '</h3>');
                        break;
                    case 'transition': html.push('<h2 class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.text + '</h2>'); break;

                    case 'dual_dialogue_begin': html.push('<div class=\"dual-dialogue\">'); break;

                    case 'dialogue_begin': html.push('<div class=\"dialogue' + (current_token.dual ? ' ' + current_token.dual : '') + '\">'); break;

                    case 'character':
                        if (current_token.dual == "left") {
                            html.push('<div class=\"dialogue left\">');
                        } else if (current_token.dual == "right") {
                            html.push('</div><div class=\"dialogue right\">');
                        }

                        if (config.print_dialogue_numbers) {
                            html.push('<h4 class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.takeNumber +' – '+ current_token.text + '</h4>');
                        } else {
                            html.push('<h4 class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.text + '</h4>');
                        }
                        
                        break;
                    case 'parenthetical': html.push('<p class="haseditorline parenthetical\" id="sourceline_' + current_token.line + '" >' + current_token.html + '</p>'); break;
                    case 'dialogue':
                        if(current_token.text == "  ") 
                            html.push('<br>');
                        else
                            html.push('<p class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>');
                        break;
                    case 'dialogue_end': html.push('</div> '); break;
                    case 'dual_dialogue_end': html.push('</div></div> '); break;

                    case 'section': html.push('<p class="haseditorline section" id="sourceline_' + current_token.line + '" data-position=\"' + current_token.line + '\" data-depth=\"' + current_token.level + '\">' + current_token.text + '</p>'); break;
                    case 'synopsis': html.push('<p class="haseditorline synopsis" id="sourceline_' + current_token.line + '" >' + current_token.html + '</p>'); break;
                    case 'lyric': html.push('<p class="haseditorline lyric" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;

                    case 'note': html.push('<p class="haseditorline note" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                    case 'boneyard_begin': html.push('<!-- '); break;
                    case 'boneyard_end': html.push(' -->'); break;

                    //case 'action': ; break;
                    case 'centered': html.push('<p class="haseditorline centered" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;

                    case 'page_break': html.push('<hr />'); break;
                    /* case 'separator':
                         html.push('<br />');
                         break;*/
                }
            }

            //This has to be dealt with later, the tokens HAVE to stay, to keep track of the structure
            /*
            if (
                (!cfg.print_actions && current_token.is("action", "transition", "centered", "shot")) ||
                (!cfg.print_notes && current_token.type === "note") ||
                (!cfg.print_headers && current_token.type === "scene_heading") ||
                (!cfg.print_sections && current_token.type === "section") ||
                (!cfg.print_synopsis && current_token.type === "synopsis") ||
                (!cfg.print_dialogues && current_token.is_dialogue()) ||
                (cfg.merge_multiple_empty_lines && current_token.is("separator") && previous_type === "separator")) {

                result.tokens.splice(current_index, 1);
                continue;
            }
            */

            //previous_type = current_token.type;
            current_index++;
        }
        result.scriptHtml = html.join('');
        if(titlehtml.length>0)
            result.titleHtml = titlehtml.join('');
        else
            result.titleHtml = undefined;
    }
    // clean separators at the end
    while (result.tokens.length > 0 && result.tokens[result.tokens.length - 1].type === "separator") {
        result.tokens.pop();
    }

    return result;
};
