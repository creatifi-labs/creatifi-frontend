"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { parseEther } from "viem"
import { createProject } from "@/lib/contracts/factory"
import { uploadMetadataToPinata, formatIPFSUri } from "@/lib/pinata"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function NewProjectPage() {
	const router = useRouter()
	const [account, setAccount] = useState<string>("")
	const [loading, setLoading] = useState(false)
	const [uploadingMetadata, setUploadingMetadata] = useState(false)
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		imageCID: "",
		targetAmount: "",
		milestone1Name: "",
		milestone1Amount: "",
		milestone2Name: "",
		milestone2Amount: "",
		milestone3Name: "",
		milestone3Amount: "",
		tier1Benefits: "",
		tier2Benefits: "",
		tier3Benefits: "",
	})
	const decimalsFromStep = (step: number) => {
	const s = step.toString();
	return s.includes(".") ? s.split(".")[1].length : 0;
	};

	const roundToStep = (raw: string, step: number, min: number) => {
	const v = Number(raw);
	if (!Number.isFinite(v)) return "";
	const rounded = Math.max(min, Math.round(v / step) * step);
	return rounded.toFixed(decimalsFromStep(step));
	};


	useEffect(() => {
		checkConnection()
	}, [])

	const checkConnection = async () => {
		if (typeof window !== "undefined" && window.ethereum) {
			try {
				const accounts = await window.ethereum.request({
					method: "eth_accounts",
				})
				if (accounts && accounts.length > 0) {
					setAccount(accounts[0])
				}
			} catch (error) {
				console.error("Error checking connection:", error)
			}
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!account) {
			toast.error("Please connect your wallet first")
			return
		}

		if (!formData.imageCID.trim()) {
			toast.error("Please provide Image CID from Pinata")
			return
		}

		const target = Number(formData.targetAmount);
		if (!Number.isFinite(target) || target < 0.001) {
			toast.error("Target Amount minimal 0.001 ETH dan tidak boleh 0/negatif");
			return;
		}

		const m1 = Number(formData.milestone1Amount);
		const m2 = Number(formData.milestone2Amount);
		const m3 = Number(formData.milestone3Amount);

		const totalMilestone = m1 + m2 + m3;
		if (totalMilestone > target) {
			toast.error(
				`Total milestone (${totalMilestone} ETH) tidak boleh lebih besar dari target project (${target} ETH)`
			);
			return;
		}

		if ([m1, m2, m3].some((v) => !Number.isFinite(v) || v < 0.0001)) {
			toast.error("Semua Milestone Amount minimal 0.0001 ETH dan tidak boleh 0/negatif");
			return;
		}

		try {
			setLoading(true)
			setUploadingMetadata(true)

			// Step 1: Generate and upload metadata to Pinata
			toast.loading("Uploading metadata to IPFS...", { id: "upload" })

			const metadata = {
			name: formData.title,
			description: formData.description,
			image: formatIPFSUri(formData.imageCID.trim()),
			tiers: [
				{ name: "Bronze", benefits: formData.tier1Benefits },
				{ name: "Silver", benefits: formData.tier2Benefits },
				{ name: "Gold",   benefits: formData.tier3Benefits },
			],
			}

			const metadataCID = await uploadMetadataToPinata(metadata)
			const rewardURI = formatIPFSUri(metadataCID)

			toast.success("Metadata uploaded successfully!", { id: "upload" })
			setUploadingMetadata(false)

			// Step 2: Create project on blockchain
			toast.loading("Creating project on blockchain...", { id: "create" })

			const milestoneNames: [string, string, string] = [
				formData.milestone1Name,
				formData.milestone2Name,
				formData.milestone3Name,
			]

			const milestoneAmounts: [bigint, bigint, bigint] = [
				parseEther(formData.milestone1Amount),
				parseEther(formData.milestone2Amount),
				parseEther(formData.milestone3Amount),
			]

			const hash = await createProject(
				formData.title,
				parseEther(formData.targetAmount),
				milestoneNames,
				milestoneAmounts,
				rewardURI
			)

			toast.success(
				`🎉 Project created successfully!\nTransaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
				{ id: "create", duration: 5000 }
			)

			// Redirect after 2 seconds
			setTimeout(() => {
				router.push("/creator")
			}, 2000)
		} catch (error) {
			console.error("Error creating project:", error)
			toast.error("Failed to create project: " + (error as Error).message, { 
				duration: 5000 
			})
		} finally {
			setLoading(false)
			setUploadingMetadata(false)
		}
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
			<Toaster 
				position="top-center"
				toastOptions={{
					style: {
						background: '#1e293b',
						color: '#fff',
					},
					success: {
						duration: 3000,
						iconTheme: {
							primary: '#10b981',
							secondary: '#fff',
						},
					},
					error: {
						duration: 4000,
						iconTheme: {
							primary: '#ef4444',
							secondary: '#fff',
						},
					},
				}}
			/>
			<TopNav />

			<div className="flex-1 container mx-auto px-4 py-8 max-w-2xl w-full">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold">Create New Project</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							Fill in the details to launch your creative campaign
						</p>
					</div>
					{account && (
						<div className="text-sm text-gray-600 dark:text-gray-400">
							{account.slice(0, 6)}...{account.slice(-4)}
						</div>
					)}
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Project Info Section */}
					<div className="space-y-4">
						<h2 className="text-xl font-semibold border-b pb-2 dark:border-slate-700">
							Project Information
						</h2>

						<div>
							<label className="block text-sm font-medium mb-2">
								Project Title <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="title"
								value={formData.title}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
								placeholder="e.g., Indie Game Studio - RPG Adventure"
							/>
							<p className="text-xs text-gray-500 mt-1">
								This will be the name of your NFT reward
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								NFT Description <span className="text-red-500">*</span>
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								required
								rows={3}
								className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
								placeholder="A proof of support for this amazing project..."
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Target Amount (ETH) <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								step="0.001"
								min="0.001"
								name="targetAmount"
								value={formData.targetAmount}
								onChange={handleChange}
								onBlur={(e) =>
									setFormData((p) => ({
									...p,
									targetAmount: roundToStep(e.target.value, 0.001, 0.001),
									}))
								}
								required
								className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
								placeholder="0.001"
								/>
						</div>
					</div>

					{/* NFT Image Section */}
					<div className="space-y-4">
						<h2 className="text-xl font-semibold border-b pb-2 dark:border-slate-700">
							NFT Reward Image
						</h2>

						<div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-4">
							<h3 className="font-medium text-sm mb-2">
								📌 How to get Image CID:
							</h3>
							<ol className="text-sm space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">
								<li>
									Go to{" "}
									<a
										href="https://pinata.cloud"
										target="_blank"
										className="text-blue-600 dark:text-blue-400 underline"
									>
										Pinata.cloud
									</a>
								</li>
								<li>Upload your NFT image</li>
								<li>Copy the CID (Content Identifier)</li>
								<li>Paste it below</li>
							</ol>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Image CID from Pinata <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="imageCID"
								value={formData.imageCID}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 font-mono text-sm"
								placeholder="bafkreidxlan2kv266x2llhmt6uax66xpblzcy22cq7k4f3sikvb267paei"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Paste only the CID, not the full ipfs:// URL
							</p>
						</div>

						{formData.imageCID && (
							<div className="text-xs text-gray-500">
								Preview URL:{" "}
								<code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
									ipfs://{formData.imageCID}
								</code>
							</div>
						)}
					</div>

					{/* Milestones Section */}
					<div className="border-t pt-6 dark:border-slate-700">
						<h2 className="text-xl font-semibold mb-4">Milestones</h2>

						{[1, 2, 3].map((num) => (
							<div
								key={num}
								className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
							>
								<h3 className="font-medium mb-3">Milestone {num}</h3>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium mb-1">
											Name <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											name={`milestone${num}Name`}
											value={
												formData[`milestone${num}Name` as keyof typeof formData]
											}
											onChange={handleChange}
											required
											className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
											placeholder={
												num === 1
													? "e.g., Initial Development & Planning"
													: num === 2
													? "e.g., Core Features Implementation"
													: "e.g., Final Testing & Launch"
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Amount (ETH) <span className="text-red-500">*</span>
										</label>
										<input
										type="number"
										step="0.0001"
										min="0.0001"
										name={`milestone${num}Amount`}
										value={formData[`milestone${num}Amount` as keyof typeof formData]}
										onChange={handleChange}
										onBlur={(e) =>
											setFormData((p) => ({
											...p,
											[`milestone${num}Amount`]: roundToStep(e.target.value, 0.0001, 0.0001),
											}) as typeof p)
										}
										required
										className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
										placeholder="≥ 0.0001"
										/>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Tiers Section */}
					<div className="border-t pt-6 dark:border-slate-700">
					<h2 className="text-xl font-semibold mb-4">Supporter Tiers</h2>

					{["Bronze", "Silver", "Gold"].map((label, idx) => {
						const num = idx + 1 as 1 | 2 | 3
						const key = `tier${num}Benefits` as const
						return (
						<div key={label} className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
							<h3 className="font-medium mb-3">{label}</h3>
							<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium mb-1">
								Rewards / Benefits for {label} tier <span className="text-red-500">*</span>
								</label>
								<textarea
								name={key}
								value={formData[key]}
								onChange={handleChange}
								rows={2}
								required
								className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
								placeholder={
									label === "Bronze"
									? "e.g., Supporter badge, thank you message"
									: label === "Silver"
									? "e.g., All Bronze + early access to updates"
									: "e.g., All Silver + name in credits & sneak-peek builds"
								}
								/>
							</div>
							</div>
						</div>
						)
					})}
					</div>


					<button
						type="submit"
						disabled={loading || !account}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{loading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								{uploadingMetadata
									? "Uploading Metadata to IPFS..."
									: "Creating Project..."}
							</>
						) : (
							"Create Project"
						)}
					</button>

					{!account && (
						<p className="text-center text-sm text-red-500">
							Please connect your wallet to create a project
						</p>
					)}
				</form>
			</div>

			<Footer />
		</div>
	)
}
