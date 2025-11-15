import User from "../schema/user.js";

export const login = async (req, res) => {
    const { login_name, password } = req.body;

    if (!login_name || !password) {
        return res.status(400).send("Missing login_name or password");
    }

    try {
        const user = await User.findOne({ login_name });
        if (!user) {
            return res.status(400).send("Invalid login_name");
        }

        if (user.password !== password) {
            return res.status(400).send("Incorrect password");
        }

        req.session.user_id = user._id;
        req.session.login_name = user.login_name;

        return res.status(200).send({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            login_name: user.login_name,
        });
    } catch (e) {
        return res.status(500).type("text/plain").send(e.toString());
    }
};

export const logout = async (req, res) => {
    if (!req.session.user_id) {
        return res.status(400).send("No session");
    }

    try {
        await req.session.destroy();
        return res.status(200).send("Logout successful");
    } catch (e) {
        return res.status(500).send("Error logging out");
    }
};
