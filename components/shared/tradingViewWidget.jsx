import React from 'react';

const TradingViewWidget = ({ link, theme = "light" }) => {
    const url = `${link}&mode=${theme}`;

    return (
        <iframe
            src={url}
            width="100%"
            height="100%"
            allowFullScreen={true}
            className="border-none rounded-2xl shadow"
        />
    );
};

export default TradingViewWidget;
