const Actions = {
    "Withdraw": { text: "برداشت" },
    "VandarWithdrawRejection": { text: "رد برداشت وندار" },
    "PaystarWithdrawRejection": { text: "رد برداشت پی‌استار" },
    "OfflineWithdrawRejection": { text: "رد برداشت" },
    "GiftCardCreation": { text: "ایجاد گیفت‌کارت" },
    "GiftCardRejection": { text: "رد گیفت‌کارت" },
    "GiftCardDeletion": { text: "حذف گیفت‌کارت" },
    "OrderBookBuy": { text: "خرید در معامله پیشرفته" },
    "OrderBookSell": { text: "فروش در معامله پیشرفته" },
    "OrderBookBuyRemaining": { text: "باقیمانده خرید سفارش معامله پیشرفته" },
    "OrderBookOrderCancelation": { text: "لغو سفارش معامله پیشرفته" },
    "ProductRequest": { text: "درخواست تحویل فیزیکی" },
    "ProductRequestRejection": { text: "رد درخواست تحویل فیزیکی" },
    "ProductRequestDiff": { text: "مابه التفاوت تحویل فیزیکی" },
    "Factor": { text: "فاکتور" },
    "BuyTransaction": { text: "تراکنش خرید" },
    "BuyTransactionRejection": { text: "رد تراکنش خرید" },
    "SellTransaction": { text: "تراکنش فروش" },
    "IdDeposit": { text: "واریز شناسه دار" },
    "VandarDeposit": { text: "واریز از درگاه وندار" },
    "PaystartDeposit": { text: "واریز از درگاه پی‌استار" },
    "OfflineDeposit": { text: "واریز دستی" },
    "ReferralReward": { text: "پاداش معرفی" },
    "AffiliateMarketing": { text: "کمیسیون معرف در خرید" },
    "ChangeByAdmin": { text: "تغییر توسط ادمین" }
}

const GetTranslation = (key) => {
    return Actions[key]?.text || "نامشخص";
}

export default GetTranslation;
