import type { HTMLAttributes, JSX } from "react";
import { BaselineIcon } from "./BaselineIcon";
import { BrowserIcons } from "./BrowserIcons";
import { SupportIcons } from "./SupportIcons";
import styles from "./BaselineStatus.module.css";

const API_ENDPOINT = "https://api.webstatus.dev/v1/features/";
// eslint-disable-next-line no-magic-numbers
const FETCH_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

type BaselineStatusType = "limited" | "newly" | "widely" | "no_data";

const BASELINE_DEFS = {
    limited: {
        title: "Limited availability",
        defaultDescription:
            "This feature is not Baseline because it does not work in some of the most widely-used browsers."
    },
    newly: {
        title: "",
        defaultDescription:
            "This feature works across the latest devices and browser versions. This feature might not work in older devices or browsers."
    },
    widely: {
        title: "Widely available",
        defaultDescription: "This feature is well established and works across many devices and browser versions."
    },
    // eslint-disable-next-line camelcase
    no_data: {
        title: "Unknown availability",
        defaultDescription: "We currently don’t have browser support information about this feature."
    }
} as const satisfies Record<BaselineStatusType, { title: string; defaultDescription: string }>;

interface BaselineStatusData {
    baseline: {
        low_date?: string;
        status: BaselineStatusType;
    };
    developer_signals?: {
        link: string;
        upvotes: number;
    };
    browser_implementations?: {
        chrome: { status: string };
        chrome_android: { status: string };
        edge: { status: string };
        firefox: { status: string };
        firefox_android: { status: string };
        safari: { status: string };
        safari_ios: { status: string };
    };
    name: string;
}

interface BaselineStatusError {
    code: number;
    message: string;
}

/**
 * Returns feature's low_date as mm-yyyy string or empty string if low_date
 * is not present.
 * @param feature Baseline status data
 * @returns Formatted date string
 */
const getBaselineDate = (feature: BaselineStatusData): string =>
    feature.baseline.low_date
        ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long"
          }).format(new Date(feature.baseline.low_date))
        : "";

/**
 * Returns Baseline's description.
 * @param baseline Baseline status
 * @param date Date string
 * @returns Description string
 */
const getDescriptionDate = (baseline: BaselineStatusType, date: string): string => {
    if (baseline === "newly" && date) {
        return `Since ${date} this feature works across the latest
    devices and browser versions. This feature might not work in older
    devices or browsers.`;
    } else if (baseline === "widely" && date) {
        return `This feature is well established and works across many
    devices and browser versions. It’s been available across browsers
    since ${date}`;
    }

    return BASELINE_DEFS[baseline].defaultDescription;
};

const getAriaLabel = (
    title: string,
    year: string,
    badge: JSX.Element,
    chrome = "no",
    edge = "no",
    firefox = "no",
    safari = "no"
    // eslint-disable-next-line max-params
): string => {
    if (title === "Unknown availability") {
        // eslint-disable-next-line no-multi-assign, no-param-reassign
        chrome = edge = firefox = safari = "unknown";
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return `Baseline: ${title}${year ? ` ${year}` : ""}${badge ? ` (newly available)` : ""}. Supported in Chrome: ${chrome === "available" ? "yes" : chrome}. Supported in Edge: ${edge === "available" ? "yes" : edge}. Supported in Firefox: ${firefox === "available" ? "yes" : firefox}. Supported in Safari: ${safari === "available" ? "yes" : safari}.`;
};

const checkAvailability = (implementations: Array<{ status: string } | undefined>): boolean =>
    implementations.every((impl) => impl?.status === "available");

const getStatus = (implementations: Array<{ status: string } | undefined>): string =>
    checkAvailability(implementations) ? "available" : "no";

const renderSupportIcon = (
    baseline: BaselineStatusType,
    implementations: Array<{ status: string } | undefined>
): JSX.Element => {
    const allAvailable = checkAvailability(implementations);
    // eslint-disable-next-line no-nested-ternary
    const support = baseline === "limited" ? (allAvailable ? "available" : "unavailable") : baseline;
    const icon = support === "newly" || support === "widely" ? "available" : support;
    const supportStyles = {
        available: styles["supportAvailable"],
        newly: styles["supportNewly"],
        // eslint-disable-next-line camelcase
        no_data: styles["supportNoData"],
        unavailable: styles["supportUnavailable"],
        widely: styles["supportWidely"]
    } as const satisfies Record<"available" | "newly" | "no_data" | "unavailable" | "widely", string | undefined>;
    return <span className={supportStyles[support]}>${SupportIcons[icon]}</span>;
};

interface BaselineStatusProps {
    /**
     * ID of the feature from https://github.com/web-platform-dx/web-features/
     * e.g. anchor-positioning
     */
    featureId: string;
    /**
     * Open external links in a new tab.
     */
    openInNewTab?: boolean;
}

/**
 * A React component that renders Baseline support information based on the
 * Web Features project.
 * @see https://github.com/web-platform-dx/web-features/
 * @param root0 Component props
 * @param root0.featureId ID of the feature to fetch and display status for
 * @param root0.className Optional additional CSS class names
 * @param root0.openInNewTab Whether to open external links in a new tab
 * @returns A JSX element displaying the Baseline status of the feature
 * @example
 * ```jsx
 * <BaselineStatus featureId="anchor-positioning" />
 * ```
 */
// eslint-disable-next-line max-lines-per-function, max-statements
const BaselineStatus = async ({
    featureId,
    openInNewTab = false,
    className,
    ...props
    // eslint-disable-next-line complexity
}: BaselineStatusProps & HTMLAttributes<HTMLDivElement>): Promise<JSX.Element> => {
    const url = API_ENDPOINT + featureId;
    const response = await fetch(url, {
        cache: "force-cache",
        next: { revalidate: FETCH_CACHE_TTL_SECONDS }
    });

    const responseJson = (await response.json()) as BaselineStatusData | BaselineStatusError;

    const missingFeature = {
        baseline: {
            status: "no_data"
        },
        name: featureId || "Unknown feature"
    } as const satisfies BaselineStatusData;

    const feature = response.ok && "baseline" in responseJson ? responseJson : missingFeature;
    const baseline = feature.baseline.status;

    const preTitle = baseline === "limited" || baseline === "no_data" ? <></> : <strong>Baseline</strong>;
    const { title } = BASELINE_DEFS[baseline];
    const badge = baseline === "newly" ? <span className={styles["baselineBadge"]}>newly available</span> : <></>;
    const baselineDate = getBaselineDate(feature);
    const description = getDescriptionDate(baseline, baselineDate);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const year = baseline === "newly" && baselineDate ? baselineDate.split(" ")[1]! : "";

    const {
        chrome,
        chrome_android: chromeAndroid,
        edge,
        firefox,
        firefox_android: firefoxAndroid,
        safari,
        safari_ios: safariIos
    } = "browser_implementations" in feature ? feature.browser_implementations : {};

    const { link: upvoteUrl, upvotes } = "developer_signals" in feature ? feature.developer_signals : {};

    return (
        <div className={[styles["host"], className].join(" ")} {...props}>
            <div className={styles["name"]}>
                {feature.name}{" "}
                {upvoteUrl && typeof upvotes === "number" && (
                    <a
                        className={styles["signalsBadge"]}
                        href={upvoteUrl}
                        target={openInNewTab ? "_blank" : "_top"}
                        // eslint-disable-next-line no-undefined
                        rel={openInNewTab ? "noopener noreferrer" : undefined}
                        // eslint-disable-next-line no-magic-numbers
                        title={`${upvotes.toString()} developer upvote${upvotes === 1 ? "" : "s"}. Need this feature across browsers? Click this and upvote it on GitHub.`}
                    >
                        {/*eslint-disable-next-line no-magic-numbers*/}
                        👍 {upvotes || 0}
                    </a>
                )}
            </div>
            <details>
                <summary
                    aria-label={getAriaLabel(
                        title,
                        year,
                        badge,
                        getStatus([chrome, chromeAndroid]),
                        getStatus([edge]),
                        getStatus([firefox, firefoxAndroid]),
                        getStatus([safari, safariIos])
                    )}
                >
                    <BaselineIcon support={baseline} />
                    <div className={styles["baselineStatusTitle"]} aria-hidden="true">
                        <div>
                            {preTitle} {title} {year} {badge}
                        </div>
                        <div className={styles["baselineStatusBrowsers"]}>
                            <span>
                                {BrowserIcons.chrome} {renderSupportIcon(baseline, [chrome, chromeAndroid])}
                            </span>
                            <span>
                                {BrowserIcons.edge} {renderSupportIcon(baseline, [edge])}
                            </span>
                            <span>
                                {BrowserIcons.firefox} {renderSupportIcon(baseline, [firefox, firefoxAndroid])}
                            </span>
                            <span>
                                {BrowserIcons.safari} {renderSupportIcon(baseline, [safari, safariIos])}
                            </span>
                        </div>
                    </div>
                    <span className={styles["openIcon"]} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
                            <path
                                d="M5.5 6.45356L0.25 1.20356L1.19063 0.262939L5.5 4.59419L9.80937 0.284814L10.75 1.22544L5.5 6.45356Z"
                                fill="currentColor"
                            />
                        </svg>
                    </span>
                </summary>
                <p>{description}</p>
                <p>
                    {baseline === "no_data" ? (
                        <></>
                    ) : (
                        <a
                            href={`https://github.com/web-platform-dx/web-features/blob/main/features/${featureId}.yml`}
                            target={openInNewTab ? "_blank" : "_top"}
                            // eslint-disable-next-line no-undefined
                            rel={openInNewTab ? "noopener noreferrer" : undefined}
                        >
                            Learn more
                        </a>
                    )}
                </p>
            </details>
        </div>
    );
};

export { BaselineStatus };
