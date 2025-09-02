export const emptyTime = -2209161600000;

export const timeH24 = 24 * 60 * 60 * 1000;
export const timeY1 = timeH24 * 365;
export const timeM3 = timeH24 * 90;
export const timeN15 = 15 * 60 * 1000;
export const timeN60 = 60 * 60 * 1000;
export const timeS60 = 60 * 1000;

/**
 * Возвращает дату в соответствии с указанным форматом.
 * Поддерживаемые значения:
 * - YYYY -- Год;
 * - MM -- Месяц;
 * - DD -- День;
 * - HH -- Час;
 * - NN -- Минуты;
 * - SS -- Секунды;
 * - ZZZ -- Миллисекунды.
 *
 * @param time Время UTC;
 * @param format Формат записи. Например DD/MM/YYYY HH:NN:SS.ZZZ;
 * @param timeZone Часовая зона в минутах. Если не число, то соответствует настройкам системы.
 */
export const formatDate = (time: number, format: string, timeZone: number = null): string =>
{
    // если время не определено, лучше вернуть пустую строку чем 1970 год
    if (Number.isNaN(time) || time == null || !format) return '';

    const utcDate = new Date((time || 0) + (timeZone || 0) * timeS60);
    const useDate = new Date(Date.UTC(
        utcDate.getFullYear(),
        utcDate.getMonth(),
        utcDate.getDate(),
        utcDate.getHours(),
        utcDate.getMinutes(),
        utcDate.getSeconds(),
        utcDate.getMilliseconds()
    ));
    const split = (!timeZone && (timeZone !== 0) ? useDate : utcDate).toISOString().split(/[-T:.Z]/);
    return format
        .replace('YYYY', split[0])
        .replace('YY', split[0].slice(-2))
        .replace('MM', split[1])
        .replace('DD', split[2])
        .replace('HH', split[3])
        .replace('NN', split[4])
        .replace('SS', split[5])
        .replace('ZZZ', split[6]);
};
