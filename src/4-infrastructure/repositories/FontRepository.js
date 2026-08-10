import { Op } from "sequelize";
export class FontRepository {


    constructor(sequelize) {

    }
    // let fontName = await SystemConfigService.getConfig(SYSTEM_DEFAULT_FONT, "defaultUIFont");
    // //找到字体名，确认字体实际路径和后缀
    // const files = await fs.promises.readdir(FONT_PATH);
    // let url = "";
    // for (let file of files) {
    //     let { name, ext } = path.parse(file);
    //     if (name === fontName) {
    //         url = `/font/${fontName}${ext}`;
    //         break;
    //     }
    // }

    // return {
    //     name: fontName,
    //     url: url,
    // }

    getUIFont(){
        console.error("TODO: getUIFont")
        return []
    }

    getModel() {
    }
}
