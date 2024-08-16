interface ArchiveResponse {
	url: string;
	code?: number | string;
	message?: string;
	archived_snapshots: {
		closest?: {
			url: string;
			available: boolean;
			timestamp: string;
			status: string;
		};
	};
}
