'use client'

import { useMantineColorScheme } from "@mantine/core";
import styles from "./Background.module.css";

export default function Background() {
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    return (
        <>
            {/* Animated Background */}
            <div className={`${styles.backgroundGradient} ${styles[theme]}`}>
                <div className={`${styles.gradientBlob1} ${styles[theme]}`}></div>
                <div className={`${styles.gradientBlob2} ${styles[theme]}`}></div>
                <div className={`${styles.gradientBlob3} ${styles[theme]}`}></div>
            </div>

            {/* Floating Shapes */}
            <div className={styles.floatingShapes}>
                <div className={`${styles.shape1} ${styles[theme]}`}></div>
                <div className={`${styles.shape2} ${styles[theme]}`}></div>
                <div className={`${styles.shape3} ${styles[theme]}`}></div>
                <div className={`${styles.shape4} ${styles[theme]}`}></div>
            </div>
        </>
    );
}