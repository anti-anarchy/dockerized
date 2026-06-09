import { useRouter } from "next/router";
import { Group, Text, Avatar, UnstyledButton } from "@mantine/core";
import Image from "next/image";

interface User {
	name: string;
	email: string;
}

interface HeaderProps {
	user: User;
}

const NAV_LINKS = [
	{ label: "Dashboard", href: "/" },
	{ label: "Responders", href: "/responders" },
	{ label: "Priority Weighting", href: "/scoring" }
];

export default function Header({ user }: HeaderProps) {
	const router = useRouter();

	function handleSignOut() {
		localStorage.removeItem("auth_user");
		router.push("/signin");
	}

	return (
		<header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
			{/* Left: logo + nav */}

			{/* UNDP Logo */}
			<Image
				src="/undp-logo.png"
				alt="UNDP"
				width={120}
				height={60}
				style={{ objectFit: "contain" }}
			/>

			{/* Nav links */}
			<nav className="flex items-stretch h-16">
				{NAV_LINKS.map((link) => {
					const isActive = router.pathname === link.href;
					return (
						<button
							key={link.href}
							onClick={() => router.push(link.href)}
							className="relative px-4 text-xs! transition-colors"
							style={{
								color: isActive ? "#171717" : "#6b7280",
								fontWeight: isActive ? 600 : 400,
								background: "none",
								border: "none",
								borderBottom: isActive
									? "2px solid #171717"
									: "2px solid transparent",
								cursor: "pointer"
							}}>
							{link.label}
						</button>
					);
				})}
			</nav>

			{/* Right: user info + sign out */}
			<Group gap="md">
				<Group gap="xs">
					<Avatar radius="xl" size="md" color="gray">
						{user.name
							.split(" ")
							.map((n) => n[0])
							.join("")}
					</Avatar>
					<div>
						<Text size="sm" fw={500} lh={1.2}>
							{user.name}
						</Text>
						<Text size="xs" c="dimmed" lh={1.2}>
							{user.email}
						</Text>
					</div>
				</Group>

				<UnstyledButton
					onClick={handleSignOut}
					style={{ color: "#e03131", fontSize: 14, fontWeight: 500 }}>
					Sign Out
				</UnstyledButton>
			</Group>
		</header>
	);
}
