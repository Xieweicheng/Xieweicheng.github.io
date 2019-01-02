package pers.mrxiexie.card.util;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Hashtable;

@Slf4j
public class QrCodeUtil {

    public static final String PNG = "png";
    public static final String JPG = "jpg";

    /**
     * 创建二维码
     *
     * @param savePath 保存路径
     * @param fileName 文件名
     * @param suffix   文件名后缀（图片格式）{@link #JPG} 或 {@link #JPG}
     * @param content  二维码内容
     * @return 创建成功或失败
     */
    public static boolean createQrCode(String savePath, String fileName, String suffix, String content) {
        int width = 300;//定义二维码的长宽
        int height = 300;
        String formt = suffix;//图片格式

        //定义二维码的参数
        HashMap<EncodeHintType, Object> hints = new HashMap<EncodeHintType, Object>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");//指定二维码的编码格式
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);//指定二维码的纠错等级,纠错等级越高,则存储的信息越少,一般是指定M级
        hints.put(EncodeHintType.MARGIN, 2);//设置二维码周围的空白

        //生成二维码
        try {
            BitMatrix bitMatrix = new MultiFormatWriter().encode(content, BarcodeFormat.QR_CODE, width, height, hints);
            Path file = new File(savePath + "/" + fileName + "." + suffix).toPath();//将指定的二维码图片生成在指定的地方
            MatrixToImageWriter.writeToPath(bitMatrix, formt, file);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * 解码
     *
     * @param imgPath 需要解析的二维码地址
     * @return 二维码内容
     */
    public static String decode(String imgPath) {
        try {
            Reader reader = new MultiFormatReader();
            File file = new File(imgPath);//获取该图片文件
            BufferedImage image;
            try {
                image = ImageIO.read(file);
                if (null != image) {
                    LuminanceSource source = new BufferedImageLuminanceSource(image);
                    BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
                    Result result;
                    Hashtable hints = new Hashtable();//将图片反解码为二维矩阵
                    hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");
                    result = new MultiFormatReader().decode(bitmap, hints);//将该二维矩阵解码成内容
                    String resultStr = result.getText();
                    return resultStr;
                } else {
                    System.out.println("未找到图片,无法解析");
                }
            } catch (IOException | ReaderException ioe) {
                ioe.printStackTrace();
            }

        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return "";
    }
}
