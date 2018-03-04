import * as React from 'react';
import * as Paginate from 'react-paginate';

import './DataTable.scss';

export type DataTableColumnConfigMap<T extends { id: number }> = {[K in keyof T]: {
	custom?: false;
	key: K;
	title?: string;
	render?: (val: T[K]) => React.ReactNode;
}};

export type DataTableCustomColumnConfigEntry<T> = {
	custom: true;
	customKey: string;
	title?: string;
	customRender: (data: T) => React.ReactNode;
};

export type DataTableDataColumnConfigEntry<T extends { id: number }> = DataTableColumnConfigMap<T>[keyof DataTableColumnConfigMap<T>];
export type DataTableColumnConfigEntry<T extends { id: number }> = DataTableDataColumnConfigEntry<T> | DataTableCustomColumnConfigEntry<T>;
export type DataTableColumnConfig<T extends { id: number }> = Array<DataTableColumnConfigEntry<T>>;

export type DataTableProps<T extends { id: number }> = {
	data: T[];
	columns?: DataTableColumnConfig<T>;
	pageSize?: number;
	renderAfterRow?: (data: T) => React.ReactNode;
	noDataPlaceholder?: JSX.Element | JSX.Element[] | string | number | null | false; // React.ReactNode doesn't work here for some reason
};

export interface DataTableState<T extends { id: number }> {
	currentPage: number;
	currentPageData: T[];
}

export default class DataTable<T extends { id: number }> extends React.Component<DataTableProps<T>, DataTableState<T>> {
	constructor(props: DataTableProps<T>) {
		super(props);
		this.state = {
			currentPage: 0,
			currentPageData: []
		};
	}

	componentDidMount() {
		this._setPage(0);
	}

	changePage = ({ selected }: { selected: number }) => {
		this._setPage(selected);
	};

	componentWillReceiveProps(newProps: DataTableProps<T>) {
		if (newProps.data !== this.props.data) {
			this._updateData(newProps.data);
		}
	}

	render() {
		if (!this.state.currentPageData.length && this.props.noDataPlaceholder) {
			return this.props.noDataPlaceholder;
		}

		const columnConfig = this._getColumnConfig();
		return (
			<div>
				<table className="DataTable">
					<thead className="DataTable__head">
					<tr className="DataTable__row DataTable__row--head">
						{columnConfig.map(column => {
							const key = column.custom ? column.customKey : column.key;
							return <th className="DataTable__cell DataTable__cell--head" key={key}>{column.title || key}</th>;
						})}
					</tr>
					</thead>
					<tbody className="DataTable__body">
					{this.state.currentPageData.map(row => (
						<tr className="DataTable__row" key={`main-${row.id}`}>
							{columnConfig.map(
								(column: DataTableColumnConfigEntry<T>) => {
									if (column.custom) {
										return <td className="DataTable__cell" key={column.customKey}>{column.customRender(row)}</td>;
									} else {
										const { key, render } = column;
										return <td className="DataTable__cell" key={key}>{render ? render(row[key]) : String(row[key])}</td>;
									}
								}
							)}
						</tr>
					))}
					</tbody>
				</table>

				<Paginate
					pageCount={this._getPageCount()}
					pageRangeDisplayed={2}
					marginPagesDisplayed={2}
					onPageChange={this.changePage}
					containerClassName="Pagination"
					pageClassName="Pagination__page"
					activeClassName="Pagination__page--active"
					previousClassName="Pagination__button Pagination__button--previous"
					nextClassName="Pagination__button Pagination__button--next"
					disabledClassName="Pagination__button--disabled"
				/>
			</div>
		);
	}

	private _getPageCount() {
		return Math.ceil(this.props.data.length / this._getCountPerPage());
	}

	private _setPage(pageNumber: number) {
		if (pageNumber < 0 || pageNumber > this._getPageCount() - 1) {
			return;
		}

		this.setState({
			currentPage: pageNumber
		});

		this._updateData(this.props.data);
	}

	private _updateData(data: T[]) {
		this.setState({
			currentPageData: data.slice(this.state.currentPage * this._getCountPerPage(), (this.state.currentPage + 1) * this._getCountPerPage())
		});
	}

	private _getColumnConfig() {
		let columnConfig = this.props.columns;

		if (!columnConfig) {
			columnConfig = this.props.data.length ? Object.keys(this.props.data[0]).map((key: keyof T) => ({ key })) : [];
		}

		return columnConfig;
	}

	private _getCountPerPage() {
		return this.props.pageSize || 10;
	}
}
