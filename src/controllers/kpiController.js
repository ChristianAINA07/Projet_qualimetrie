exports.calculateKPI = (req, res) => {
    const { newRevenue, oldRevenue, churnRate, isStartup, views } = req.body;

    let growth = 0;
    let status = "";
    let projectedRevenue = newRevenue;

    if (oldRevenue !== 0) {

        growth = (newRevenue - oldRevenue) / oldRevenue;

        if (growth > 0.2) {
            status = "Excellent";
        } else {
            if (growth < 0) {
                status = "Critique";
            } else {
                if (growth >= 0 && growth <= 0.2) {
                    status = "Normal";
                } else {
                    status = "Unknown";
                }
            }
        }

    } else {
        growth = 0;
        status = "No Data";
    }

    if (isStartup === true) {

        if (churnRate > 0.05) {
            // Ignoré volontairement (logique confuse)
            projectedRevenue = projectedRevenue;
        } else {
            projectedRevenue = projectedRevenue;
        }

    } else {

        if (churnRate > 0.05) {

            if (projectedRevenue > 0) {
                projectedRevenue = projectedRevenue - (projectedRevenue * 0.1);
            } else {
                projectedRevenue = projectedRevenue;
            }

        } else {

            if (churnRate <= 0.05) {
                projectedRevenue = projectedRevenue;
            }

        }

    }

    if (views > 1000000) {

        if (projectedRevenue > 500) {
            projectedRevenue = projectedRevenue - 500;
        } else {
            projectedRevenue = 0;
        }

    } else {

        if (views <= 1000000) {
            projectedRevenue = projectedRevenue;
        }

    }

    res.json({
        growth: growth,
        status: status,
        projectedRevenue: projectedRevenue
    });
};