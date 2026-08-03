import { useEffect } from 'react';

export const useSystemBarColor = (color: string) => {
    useEffect(() => {
        const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        const previousThemeColor = themeColor?.content;
        const previousHtmlColor = document.documentElement.style.backgroundColor;
        const previousBodyColor = document.body.style.backgroundColor;

        themeColor?.setAttribute('content', color);
        document.documentElement.style.backgroundColor = color;
        document.body.style.backgroundColor = color;

        return () => {
            if (themeColor && previousThemeColor) themeColor.content = previousThemeColor;
            document.documentElement.style.backgroundColor = previousHtmlColor;
            document.body.style.backgroundColor = previousBodyColor;
        };
    }, [color]);
};

export default useSystemBarColor;
